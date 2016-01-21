@echo off

call move.bat
rem call clear.bat

SET VIRTUAL_ENV=D:\progs\firefox_sdk\
call cfx xpi

rem copy /b /Y nnru_updates.xpi C:\Users\EUGENE~1\APPLIC~1\Mozilla\Firefox\Profiles\PWMPLE~1.DEF\EXTENS~1\jid1-9HJLe0eYgzUn3Q@jetpack.xpi >nul
rem del nnru_updates.xpi
