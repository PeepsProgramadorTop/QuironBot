@echo off
echo Escolha uma opcao:
echo 1 - Debug
echo 2 - Dev
echo 3 - Start
echo 4 - Format

set /p opcao=Digite o numero da opcao:

goto opcao%opcao%


:opcao1
npm run debug
goto fim

:opcao2
npm run dev
goto fim

:opcao3
npm run start
goto fim

:opcao4
npm run format
goto fim

:fim
