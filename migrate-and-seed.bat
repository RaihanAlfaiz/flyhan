@echo off
echo Pushing schema to database...
call npx prisma db push
echo.
echo Generating Prisma Client...
call npx prisma generate
echo.
echo Seeding database (ignore errors if data exists)...
call npx prisma db seed
echo.
echo Done!
