# 배포 순서

## 1. Google Sheets

먼저 분할 소스에서 배포용 파일을 생성하고 동기화를 확인합니다.

```bash
node build-apps-script.mjs
node build-apps-script.mjs --check
```

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

## 4. 기존 기록 마이그레이션

기존 `Records` 데이터가 있다면 Apps Script 편집기에서 다음 함수를 한 번 실행합니다.

```js
migrateRecordsToStudentRecords()
```

이 함수는 기존 `Records`를 수정하거나 삭제하지 않고, 학생별 기록을 새 `StudentRecords` 시트로 복사합니다.
재실행해도 새 구조에 저장된 기록을 우선하므로 최근 기록을 덮어쓰지 않습니다.

실행 로그에서 `students`, `sourceRows`, `migratedRecords`, `duplicatesResolved`, `invalidRows`를 확인합니다.

## 5. Apps Script 재배포

코드를 수정한 뒤 웹 앱의 새 버전을 배포합니다. 기존 배포 URL을 계속 사용하도록 기존 배포를 수정합니다.

아래 주소를 순서대로 열어 응답의 `ok`가 `true`인지 확인합니다.

```text
웹앱_URL?action=setup
웹앱_URL?action=schools
웹앱_URL?action=grades&year=2026&school=학교명
웹앱_URL?action=students&year=2026&school=학교명&grade=학년
```

## 6. GitHub Pages

이 폴더를 GitHub 저장소의 루트로 올리고 Pages 배포 방식을 GitHub Actions로 선택합니다.

배포가 끝나면 학생에게 GitHub Pages 주소를 안내하면 됩니다.

학교별 링크는 아래 형식입니다.

```text
https://사용자명.github.io/저장소명/index.html?school=학교명&year=2026
```

배포된 사이트의 `school-links.html`을 열면 Google Sheets의 학생 명단을 기준으로 학교별 링크를 복사할 수 있습니다.

페이지는 마지막으로 성공한 학교·학년·학생·개인 기록을 브라우저에 보관했다가 즉시 표시하고,
백그라운드에서 Apps Script의 최신 데이터로 갱신합니다.
