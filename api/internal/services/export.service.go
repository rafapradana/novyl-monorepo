package services

import (
	"archive/zip"
	"bytes"
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/go-shiori/go-epub"
	"github.com/google/uuid"
	"github.com/novyl/novyl/internal/config"
	"github.com/novyl/novyl/internal/models"
	"github.com/novyl/novyl/internal/repositories"
	"github.com/novyl/novyl/internal/utils"
	"github.com/signintech/gopdf"
)

// ExportInput adalah input untuk export novel.
type ExportInput struct {
	Format string `json:"format" validate:"required,oneof=pdf epub docx"`
}

// ExportOutput adalah output export novel.
type ExportOutput struct {
	DownloadURL string `json:"download_url"`
	Format      string `json:"format"`
	FileSize    int64  `json:"file_size"`
}

// ExportNovel meng-generate file novel dalam format yang dipilih.
func ExportNovel(novelID, userID uuid.UUID, input ExportInput, cfg *config.Config) (*ExportOutput, error) {
	novel, err := repositories.FindNovelByID(novelID)
	if err != nil {
		return nil, ErrNovelNotFound
	}
	if novel.UserID != userID {
		return nil, ErrNotOwner
	}

	chapters, err := repositories.FindChaptersByNovel(novelID)
	if err != nil {
		return nil, err
	}

	var fileBytes []byte
	var ext string

	switch input.Format {
	case "pdf":
		fileBytes, err = generatePDF(novel, chapters)
		ext = "pdf"
	case "epub":
		fileBytes, err = generateEPUB(novel, chapters)
		ext = "epub"
	case "docx":
		fileBytes, err = generateDOCX(novel, chapters)
		ext = "docx"
	default:
		return nil, fmt.Errorf("format tidak didukung: %s", input.Format)
	}

	if err != nil {
		return nil, fmt.Errorf("gagal generate %s: %w", input.Format, err)
	}

	objectKey := fmt.Sprintf("%s/%s/export/%s.%s", userID.String(), novelID.String(), novelID.String(), ext)

	// Upload to MinIO
	_, err = utils.MinioClient.PutObject(
		context.Background(),
		cfg.MinIOBucket,
		objectKey,
		bytes.NewReader(fileBytes),
		int64(len(fileBytes)),
		utils.MinioPutOptions(),
	)
	if err != nil {
		return nil, fmt.Errorf("gagal upload file ke storage: %w", err)
	}

	// Save export record
	fileSize := int64(len(fileBytes))
	export := &models.NovelExport{
		ID:       uuid.New(),
		NovelID:  novelID,
		UserID:   userID,
		Format:   input.Format,
		FilePath: objectKey,
		FileSize: &fileSize,
	}
	if err := repositories.CreateNovelExport(export); err != nil {
		fmt.Printf("Warning: failed to save export record: %v\n", err)
	}

	// Generate download URL
	downloadURL, err := utils.PresignedGetURL(context.Background(), cfg.MinIOBucket, objectKey, 60*time.Minute)
	if err != nil {
		return nil, fmt.Errorf("gagal membuat download URL: %w", err)
	}

	return &ExportOutput{
		DownloadURL: downloadURL.String(),
		Format:      input.Format,
		FileSize:    int64(len(fileBytes)),
	}, nil
}

func generatePDF(novel *models.Novel, chapters []models.Chapter) ([]byte, error) {
	pdf := gopdf.GoPdf{}
	pdf.Start(gopdf.Config{PageSize: *gopdf.PageSizeA4})

	// Title page
	pdf.AddPage()
	pdf.SetFont("Helvetica", "", 24)
	pdf.SetXY(100, 200)
	pdf.Cell(nil, novel.Title)

	if novel.Genre != nil {
		pdf.SetFont("Helvetica", "", 14)
		pdf.SetXY(100, 240)
		pdf.Cell(nil, *novel.Genre)
	}

	// Chapters
	for _, ch := range chapters {
		pdf.AddPage()
		pdf.SetFont("Helvetica", "", 18)
		pdf.SetXY(50, 50)
		pdf.Cell(nil, ch.Title)

		if ch.Content != nil {
			pdf.SetFont("Helvetica", "", 11)
			lines := splitText(*ch.Content, 90)
			y := 80.0
			for _, line := range lines {
				if y > 750 {
					pdf.AddPage()
					y = 50
				}
				pdf.SetXY(50, y)
				pdf.Cell(nil, line)
				y += 15
			}
		}
	}

	var buf bytes.Buffer
	_, err := pdf.WriteTo(&buf)
	return buf.Bytes(), err
}

func generateEPUB(novel *models.Novel, chapters []models.Chapter) ([]byte, error) {
	title := novel.Title
	if title == "" {
		title = "Novel"
	}

	e, err := epub.NewEpub(title)
	if err != nil {
		return nil, err
	}

	if novel.Genre != nil {
		e.SetLang(*novel.Genre)
	}

	for _, ch := range chapters {
		content := ""
		if ch.Content != nil {
			// Content is HTML from Tiptap, use as-is but escape for XML safety
			content = *ch.Content
		}
		chTitle := escapeXML(ch.Title)
		html := fmt.Sprintf("<h1>%s</h1>%s", chTitle, content)
		_, _ = e.AddSection(html, ch.Title, "", "")
	}

	e.SetLang("id")

	var buf bytes.Buffer
	_, err = e.WriteTo(&buf)
	return buf.Bytes(), err
}

func generateDOCX(novel *models.Novel, chapters []models.Chapter) ([]byte, error) {
	var buf bytes.Buffer

	// Build a simple XML-based DOCX manually
	buf.WriteString(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
<w:body>`)

	// Title
	buf.WriteString(fmt.Sprintf(`<w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="48"/></w:rPr><w:t>%s</w:t></w:r></w:p>`, escapeXML(novel.Title)))

	if novel.Genre != nil {
		buf.WriteString(fmt.Sprintf(`<w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:sz w:val="28"/></w:rPr><w:t>%s</w:t></w:r></w:p>`, escapeXML(*novel.Genre)))
	}

	buf.WriteString(`<w:p><w:r><w:br w:type="page"/></w:r></w:p>`)

	// Chapters
	for _, ch := range chapters {
		buf.WriteString(fmt.Sprintf(`<w:p><w:r><w:rPr><w:b/><w:sz w:val="36"/></w:rPr><w:t>%s</w:t></w:r></w:p>`, escapeXML(ch.Title)))

		if ch.Content != nil {
			paragraphs := strings.Split(*ch.Content, "\n")
			for _, para := range paragraphs {
				if strings.TrimSpace(para) != "" {
					buf.WriteString(fmt.Sprintf(`<w:p><w:r><w:rPr><w:sz w:val="24"/></w:rPr><w:t>%s</w:t></w:r></w:p>`, escapeXML(para)))
				}
			}
		}

		buf.WriteString(`<w:p><w:r><w:br w:type="page"/></w:r></w:p>`)
	}

	buf.WriteString(`</w:body></w:document>`)

	// Create a proper DOCX zip
	docxBytes, err := createDOCXZip(buf.Bytes())
	if err != nil {
		return nil, err
	}

	return docxBytes, nil
}

func splitText(text string, maxLen int) []string {
	words := strings.Fields(text)
	var lines []string
	var currentLine string

	for _, word := range words {
		if len(currentLine)+len(word)+1 > maxLen {
			lines = append(lines, currentLine)
			currentLine = word
		} else {
			if currentLine != "" {
				currentLine += " "
			}
			currentLine += word
		}
	}
	if currentLine != "" {
		lines = append(lines, currentLine)
	}

	return lines
}

func escapeXML(s string) string {
	s = strings.ReplaceAll(s, "&", "&amp;")
	s = strings.ReplaceAll(s, "<", "&lt;")
	s = strings.ReplaceAll(s, ">", "&gt;")
	s = strings.ReplaceAll(s, "\"", "&quot;")
	s = strings.ReplaceAll(s, "'", "&apos;")
	return s
}

func createDOCXZip(documentXML []byte) ([]byte, error) {
	var buf bytes.Buffer

	// Use archive/zip to create a valid DOCX
	zipWriter := zip.NewWriter(&buf)

	// [Content_Types].xml
	ct := `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`
	ctFile, _ := zipWriter.Create("[Content_Types].xml")
	ctFile.Write([]byte(ct))

	// _rels/.rels
	rels := `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`
	relsFile, _ := zipWriter.Create("_rels/.rels")
	relsFile.Write([]byte(rels))

	// word/document.xml
	docFile, _ := zipWriter.Create("word/document.xml")
	docFile.Write(documentXML)

	// word/_rels/document.xml.rels
	docRels := `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
</Relationships>`
	docRelsFile, _ := zipWriter.Create("word/_rels/document.xml.rels")
	docRelsFile.Write([]byte(docRels))

	err := zipWriter.Close()
	return buf.Bytes(), err
}
