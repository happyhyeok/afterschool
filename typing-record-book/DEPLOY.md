# 배포 순서

## 1. Google Sheets

Google Sheets 파일을 만들고 Apps Script에 `apps-script/Code.gs`를 붙여넣습니다.

웹 앱 배포 설정:

- 실행 사용자: 나
- 액세스 권한: 링크가 있는 모든 사용자

배포 뒤 웹 앱 URL을 복사합니다.

## 2. 웹페이지 설정

`config.js`를 열고 아래 값을 바꿉니다.

```js
window.TYPING_RECORD_CONFIG = {
  APPS_SCRIPT_URL: "https://script.google.com/macros/s/배포_ID/exec",
  DEFAULT_YEAR: "2026",
};
```

## 3. 학생 명단

웹 앱 URL 뒤에 `?action=setup`을 붙여 한 번 실행한 뒤 `Students` 탭에 학생 명단을 넣습니다.

필수 입력 열:

- `year`
- `school`
- `grade`
- `number`
- `name`
- `active`

`active`는 사용할 학생이면 `TRUE`, 숨길 학생이면 `FALSE`로 둡니다.

## 4. GitHub Pages

이 폴더를 GitHub 저장소의 루트로 올리고 Pages 배포 방식을 GitHub Actions로 선택합니다.

배포가 끝나면 학생에게 GitHub Pages 주소를 안내하면 됩니다.

학교별 링크는 아래 형식입니다.

```text
https://사용자명.github.io/저장소명/index.html?school=학교명&year=2026
```

배포된 사이트의 `school-links.html`을 열면 Google Sheets의 학생 명단을 기준으로 학교별 링크를 복사할 수 있습니다.
