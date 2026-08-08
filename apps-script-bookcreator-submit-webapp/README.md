# 상상대로 AI Book Creator 제출 Web App

학생용 `ai-4-dream-picture-book.html`의 Book Creator 완성 책 링크 제출을 받는 Google Apps Script 프로젝트입니다.

- Spreadsheet: `상상대로AI_결과물`
- Spreadsheet ID: `1itagZ7rcc_djAUgxiqKUoPN0g7GLC_JJak2BoQz9tMg`
- Sheet: `시트1`
- API service: `sangsang-ai-book-submit`

## API

- `GET ?action=health`
- `GET ?action=roster`
- `POST action=submitBook&grade=...&name=...&bookUrl=...`

제출은 새 행을 추가하지 않고 `학년 + 성명`이 일치하는 기존 학생 행의 C:F만 갱신합니다.
