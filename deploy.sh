#!/usr/bin/env bash

set -e # 도중에 오류 발생시 스크립트를 종료한다.

echo ">> 빌드를 시작합니다 <<"
npm run build

echo ">> 빌드 Directory로 이동 <<"
cd dist

echo ">> git init <<"
git init
git add -A
git commit -m "Deploy"

echo ">> git push <<"
git push -f https://github.com/err2083/TIL_Vue main:gh-pages

cd ..