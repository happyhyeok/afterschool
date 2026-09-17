# Apps Script 분할 붙여넣기 버전

Apps Script 편집기에서 `+` 버튼을 눌러 스크립트 파일을 8개 만듭니다.

각 파일 이름과 내용:

1. `01_Config.gs`
2. `02_Routes.gs`
3. `03_Students.gs`
4. `04_Records.gs`
5. `05_Sheets.gs`
6. `06_Utils.gs`
7. `07_Cache.gs`
8. `08_Migration.gs`

한 파일씩 열어서 같은 이름의 로컬 파일 내용을 붙여넣으면 됩니다.

Apps Script는 같은 프로젝트 안의 `.gs` 파일들을 한 코드처럼 실행하므로, 파일을 나눠도 웹 앱 동작은 같습니다.

배포용 단일 파일 `apps-script/Code.gs`는 다음 명령으로 생성합니다.

```bash
node build-apps-script.mjs
```

동기화 여부만 검사하려면 다음 명령을 사용합니다.

```bash
node build-apps-script.mjs --check
```
