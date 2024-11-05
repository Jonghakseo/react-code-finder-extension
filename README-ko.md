<div align="center">
<img src="chrome-extension/public/icon-128.png" alt="logo"/>
<h1> React Code Finder</h1>

![](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black)
![](https://img.shields.io/badge/Typescript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![](https://badges.aleen42.com/src/vitejs.svg)
![GitHub action badge](https://github.com/Jonghakseo/react-code-finder-extension/actions/workflows/build-zip.yml/badge.svg)

> 해당 익스텐션은 이 [보일러 플레이트](https://github.com/Jonghakseo/chrome-extension-boilerplate-react-vite)로 만들어졌습니다. 

[한국어](README-ko.md) | [English](README.md)

</div>

https://github.com/user-attachments/assets/93f24185-aa41-44c1-a724-c835e10b1c5e

## 목차

- [시작하기 전에](#intro)
- [설치](#install)
- [누구에게 도움이 되나요?](#who-will-benefit)
- [사용법](#how-to-use)
- [한계](#limitations)

## 시작하기 전에 <a name="intro"></a>

React Code Finder는 React를 사용하여 프론트엔드 개발을 할 때 도움이 되는 크롬 익스텐션입니다. 이 익스텐션은 브라우저에 렌더링된 요소를 통해 리액트 컴포넌트를 쉽게 찾고, 해당 컴포넌트의 소스 코드를 빠르게 확인하고 수정할 수 있도록 도와줍니다. 


## 설치 <a name="install"></a>

익스텐션 설치는 [Chrome 웹 스토어](https://chromewebstore.google.com/detail/react-code-finder/bbidpgoneibefablhfcnaennjkfbflmk)로 이동하여 설치 버튼을 통해 설치하면 됩니다. (로컬 터미널에서 추가적인 서버 실행이 권장됩니다. 아래 내용을 참고해주세요.)

## 누구에게 도움이 되나요? <a name="who-will-benefit"></a>

React Code Finder는 특히 다음과 같은 사람들에게 유용합니다:

- 프로덕트의 규모가 커지면서 렌더링 된 요소를 바탕으로 소스코드를 빠르게 찾기 어려운 개발자
- react devtools 익스텐션의 사용성에 불만을 느끼는 개발자
- 코드를 실시간으로 수정하고 브라우저에서 변경 사항을 확인하고 싶은 개발자

## 사용법 <a name="how-to-use"></a>

1. 개발자 도구를 열고 React Code Finder 패널을 찾습니다. (힌트: 패널의 위치를 가장 왼쪽으로 설정해두면 사용시 편리합니다)
2. React Code Finder 패널이 활성화되어 있는지 확인하고, 익스텐션 아이콘이 On으로 변경되어 있는지 확인합니다. (패널의 열림 또는 닫힘 상태를 감지하여 자동으로 토글됩니다)
3. (권장) React Code Finder 패널 상단의 복사 아이콘을 눌러 `npx react-code-finder-server -p 3010`을 터미널에 입력합니다. 만약 3010 포트가 겹치면 변경할 수 있습니다.
4. 찾고자 하는 HTMLElement 위에 마우스를 올려 컴포넌트의 이름을 확인합니다.
5. 해당 컴포넌트를 선택하려면 마우스 오른쪽 버튼을 클릭합니다. (컴포넌트의 소스 코드를 보고 편집하려면 react-code-finder-server가 실행 중이어야 합니다)
6. 소스 코드의 계층 구조를 탐색하려면 Select UI를 사용합니다.
7. 만약 로컬 IDE에서 열고 싶다면 아이콘을 클릭하거나 `CMD + K`를 사용합니다. 소스 코드를 직접 수정하고 `CMD + S` 단축키로 빠르게 저장/테스트할 수 있습니다. (주의: 실제 로컬 소스 코드를 변경하는 동작입니다)

### 도움이 되는 정보

- 만약 `react-code-finder-server`가 실행 중이 아니라면, Props 조회, 코드 위치 찾기 및 에디터에서 열기 기능만 사용할 수 있습니다. 익스텐션의 옵션 페이지에서 선호하는 IDE를 설정할 수 있습니다. (기본값: vscode)
- 익스텐션의 옵션 페이지에서 다른 옵션을 찾을 수 있습니다. (익스텐션 아이콘을 마우스 오른쪽 버튼 클릭 후 옵션 클릭!)

## 한계 <a name="limitations"></a>

이 익스텐션은 아직 React 서버 컴포넌트(RSC)와 함께 작동하지 않습니다. 
익스텐션이 내부적으로 `HTMLElement`, `React Fiber`, `_debugSource` 간의 바인딩에 의존하고 있기 때문입니다.

아래 링크에서 해당 이슈를 확인할 수 있습니다. react devtools의 구현에 따라 추가적인 RSC 지원이 추가될 수 있습니다.

- https://github.com/facebook/react/issues/27758

