<div align="center">
<img src="chrome-extension/public/icon-128.png" alt="logo"/>
<h1> React Code Finder</h1>

![](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black)
![](https://img.shields.io/badge/Typescript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![](https://badges.aleen42.com/src/vitejs.svg)
![GitHub action badge](https://github.com/Jonghakseo/react-code-finder-extension/actions/workflows/build-zip.yml/badge.svg)


> This project is generated by [boilerplate](https://github.com/Jonghakseo/chrome-extension-boilerplate-react-vite) 

[한국어](README-ko.md) | [English](README.md)

</div>

https://github.com/user-attachments/assets/93f24185-aa41-44c1-a724-c835e10b1c5e

## Table of Contents

- [Intro](#intro)
- [Install](#install)
- [Who Will Benefit](#who-will-benefit)
- [How to use](#how-to-use)
- [Limitations](#limitations)

## Intro <a name="intro"></a>
React Code Finder is a powerful development tool extension designed for Chrome. This extension aims to help React developers inspect and edit code more efficiently and swiftly right from the web browser.


## Install <a name="install"></a>
Adding React Code Finder to Chrome is simple. Just head over to the [Chrome Web Store](https://chromewebstore.google.com/detail/react-code-finder/bbidpgoneibefablhfcnaennjkfbflmk) and click on the 'Add to Chrome' button. The extension will then be ready for use.


## Who Will Benefit <a name="who-will-benefit"></a>
React Code Finder is incredibly useful for:
- Developers who find it challenging to locate parts of their code as their projects grow in size
- Developers who are dissatisfied with the usability of the react-devtools extension
- Developers who wish to edit code in real-time and see the changes within the web browser


## How to use <a name="how-to-use"></a>

1. Open Developer Tools and find the panel labeled React Code Finder. (Hint: it's very convenient to set the panel's position to the far left)
2. With the React Code Finder panel enabled, make sure the extension icon is changed to On. (You can toggle it manually, but by default it will automatically toggle by detecting the panel's open or closed state)
3. (Recommended) Press the copy icon at the top of the React Code Finder panel and run `npx react-code-finder-server -p 3010` into the terminal. You can change the port if it overlaps.
3. Hover over the web component you want to find to see the component's name.
4. If you want to select the component, right-click on it. (For viewing/editing the component's source code, `react-code-finder-server` must be running)
5. Use the Select UI to navigate through the hierarchy of the source code.
6. If you want to open it in your local IDE, you can click the icon or use `CMD + K`. You can modify the source code directly in the editor and quickly save/test your changes with the `CMD + S` shortcut. (Note: This will also change the actual local source code.)

### More info

- If react-code-finder-server is not running, you can only use the props lookup and the ability to locate the code and open it in an editor. You can set your preferred IDE on the extension's options page. (Default: vscode)
- You can find other options from extension's option page. (Right-click extension icon and click option!)

## Limitations <a name="limitations"></a>

This extension does not yet work with the react server component (RSC), as it relies internally on the binding between the html element and React Fiber, and the _debugSource field.

- https://github.com/facebook/react/issues/27758

