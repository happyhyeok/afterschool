# 타자연습 기록장

한컴타자 연습 후 학생이 직접 기록을 남기는 GitHub Pages + Google Sheets 연동형 기록장입니다.

## 구조

- `index.html`, `styles.css`, `app.js`: 학생 입력 웹페이지
- `config.js`: Apps Script 배포 주소 설정
- `apps-script/Code.gs`: Google Sheets에 기록을 저장하는 Apps Script
- `.github/workflows/pages.yml`: GitHub Pages 자동 배포

## 학생 화면

학생은 연도, 학교, 학년, 이름을 선택한 뒤 한 페이지에서 전체 기록을 입력합니다.
학교별 링크는 `index.html?school=학교명&year=2026` 형식으로 만들 수 있으며, 이 링크에서는 학생이 학년과 이름만 선택합니다.
배포 후 `school-links.html`을 열면 학교별 링크를 복사할 수 있습니다.

- 기본자리, 왼손윗자리, 왼손아랫자리, 오른손윗자리, 오른손아래자리, 숫자자리, 전체자리: 각 3회
- 낱말연습: 10회
- 장문연습: 10회
- 입력값: 날짜/시간, 정확도 %, 소요시간 `mm:ss`

## Google Sheets 준비

1. Google Sheets를 하나 만듭니다.
2. `apps-script/Code.gs`를 Apps Script에 붙여넣고 웹 앱으로 배포합니다.
3. 배포 URL 뒤에 `?action=setup`을 붙여 한 번 실행합니다.
4. `Students` 탭에 학생을 입력합니다.

`Students` 탭의 기본 열:

| year | school | grade | studentId | number | name | active | createdAt |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 2026 | 예시초 | 3 |  | 1 | 김민준 | TRUE |  |

`studentId`는 비워두어도 첫 조회 때 자동 생성됩니다.

## GitHub Pages 배포

1. 이 폴더를 GitHub 저장소로 올립니다.
2. `config.js`의 `APPS_SCRIPT_URL`에 Apps Script 웹 앱 URL을 넣습니다.
3. GitHub 저장소의 Pages 설정에서 GitHub Actions 배포를 선택합니다.
4. `main` 브랜치에 push하면 자동 배포됩니다.
