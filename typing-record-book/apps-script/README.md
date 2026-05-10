# Apps Script 연결

1. Google Sheets에서 `확장 프로그램` > `Apps Script`를 엽니다.
2. `Code.gs` 내용을 붙여넣습니다.
3. 배포 > 새 배포 > 웹 앱을 선택합니다.
4. 실행 사용자는 본인, 액세스 권한은 링크가 있는 모든 사용자로 배포합니다.
5. 배포 URL을 `config.js`의 `APPS_SCRIPT_URL`에 넣습니다.
6. 배포 URL 뒤에 `?action=setup`을 붙여 한 번 열면 `Students`, `Records` 탭이 준비됩니다.
