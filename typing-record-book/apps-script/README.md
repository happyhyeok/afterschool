# Apps Script 연결

1. Google Sheets에서 `확장 프로그램` > `Apps Script`를 엽니다.
2. `Code.gs` 내용을 붙여넣습니다.
3. 배포 > 새 배포 > 웹 앱을 선택합니다.
4. 실행 사용자는 본인, 액세스 권한은 링크가 있는 모든 사용자로 배포합니다.
5. 배포 URL을 `config.js`의 `APPS_SCRIPT_URL`에 넣습니다.
6. 배포 URL 뒤에 `?action=setup`을 붙여 한 번 열면 `Students`, `Records`, `StudentRecords` 탭이 준비됩니다.
7. 기존 기록이 있다면 Apps Script 편집기에서 `migrateRecordsToStudentRecords()`를 한 번 실행합니다.

`setup`은 `Students`, `Records`, `StudentRecords` 시트를 준비하고 누락된 학생 ID를 생성합니다.
일반 조회 요청에서는 시트 서식 지정이나 열 너비 자동 조정을 실행하지 않습니다.
