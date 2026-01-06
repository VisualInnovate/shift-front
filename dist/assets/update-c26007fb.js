import{ao as U,ap as C,aq as T,ar as j,e as k,h,g as e,aa as H,as as a,ab as B,ac as N,_ as L,u as R,p as D,a as I,r as z,o as M,b as S,i as d,w as P,j as i,t as p,s as Q,U as u,v as f,W as K,am as A}from"./index-cbbedec6.js";var F=`
/*!
 * Quill Editor v1.3.3
 * https://quilljs.com/
 * Copyright (c) 2014, Jason Chen
 * Copyright (c) 2013, salesforce.com
 */
.ql-container {
    box-sizing: border-box;
    font-family: Helvetica, Arial, sans-serif;
    font-size: 13px;
    height: 100%;
    margin: 0px;
    position: relative;
}
.ql-container.ql-disabled .ql-tooltip {
    visibility: hidden;
}
.ql-container.ql-disabled .ql-editor ul[data-checked] > li::before {
    pointer-events: none;
}
.ql-clipboard {
    left: -100000px;
    height: 1px;
    overflow-y: hidden;
    position: absolute;
    top: 50%;
}
.ql-clipboard p {
    margin: 0;
    padding: 0;
}
.ql-editor {
    box-sizing: border-box;
    line-height: 1.42;
    height: 100%;
    outline: none;
    overflow-y: auto;
    padding: 12px 15px;
    tab-size: 4;
    -moz-tab-size: 4;
    text-align: left;
    white-space: pre-wrap;
    word-wrap: break-word;
}
.ql-editor > * {
    cursor: text;
}
.ql-editor p,
.ql-editor ol,
.ql-editor ul,
.ql-editor pre,
.ql-editor blockquote,
.ql-editor h1,
.ql-editor h2,
.ql-editor h3,
.ql-editor h4,
.ql-editor h5,
.ql-editor h6 {
    margin: 0;
    padding: 0;
    counter-reset: list-1 list-2 list-3 list-4 list-5 list-6 list-7 list-8 list-9;
}
.ql-editor ol,
.ql-editor ul {
    padding-left: 1.5rem;
}
.ql-editor ol > li,
.ql-editor ul > li {
    list-style-type: none;
}
.ql-editor ul > li::before {
    content: '\\2022';
}
.ql-editor ul[data-checked='true'],
.ql-editor ul[data-checked='false'] {
    pointer-events: none;
}
.ql-editor ul[data-checked='true'] > li *,
.ql-editor ul[data-checked='false'] > li * {
    pointer-events: all;
}
.ql-editor ul[data-checked='true'] > li::before,
.ql-editor ul[data-checked='false'] > li::before {
    color: #777;
    cursor: pointer;
    pointer-events: all;
}
.ql-editor ul[data-checked='true'] > li::before {
    content: '\\2611';
}
.ql-editor ul[data-checked='false'] > li::before {
    content: '\\2610';
}
.ql-editor li::before {
    display: inline-block;
    white-space: nowrap;
    width: 1.2rem;
}
.ql-editor li:not(.ql-direction-rtl)::before {
    margin-left: -1.5rem;
    margin-right: 0.3rem;
    text-align: right;
}
.ql-editor li.ql-direction-rtl::before {
    margin-left: 0.3rem;
    margin-right: -1.5rem;
}
.ql-editor ol li:not(.ql-direction-rtl),
.ql-editor ul li:not(.ql-direction-rtl) {
    padding-left: 1.5rem;
}
.ql-editor ol li.ql-direction-rtl,
.ql-editor ul li.ql-direction-rtl {
    padding-right: 1.5rem;
}
.ql-editor ol li {
    counter-reset: list-1 list-2 list-3 list-4 list-5 list-6 list-7 list-8 list-9;
    counter-increment: list-0;
}
.ql-editor ol li:before {
    content: counter(list-0, decimal) '. ';
}
.ql-editor ol li.ql-indent-1 {
    counter-increment: list-1;
}
.ql-editor ol li.ql-indent-1:before {
    content: counter(list-1, lower-alpha) '. ';
}
.ql-editor ol li.ql-indent-1 {
    counter-reset: list-2 list-3 list-4 list-5 list-6 list-7 list-8 list-9;
}
.ql-editor ol li.ql-indent-2 {
    counter-increment: list-2;
}
.ql-editor ol li.ql-indent-2:before {
    content: counter(list-2, lower-roman) '. ';
}
.ql-editor ol li.ql-indent-2 {
    counter-reset: list-3 list-4 list-5 list-6 list-7 list-8 list-9;
}
.ql-editor ol li.ql-indent-3 {
    counter-increment: list-3;
}
.ql-editor ol li.ql-indent-3:before {
    content: counter(list-3, decimal) '. ';
}
.ql-editor ol li.ql-indent-3 {
    counter-reset: list-4 list-5 list-6 list-7 list-8 list-9;
}
.ql-editor ol li.ql-indent-4 {
    counter-increment: list-4;
}
.ql-editor ol li.ql-indent-4:before {
    content: counter(list-4, lower-alpha) '. ';
}
.ql-editor ol li.ql-indent-4 {
    counter-reset: list-5 list-6 list-7 list-8 list-9;
}
.ql-editor ol li.ql-indent-5 {
    counter-increment: list-5;
}
.ql-editor ol li.ql-indent-5:before {
    content: counter(list-5, lower-roman) '. ';
}
.ql-editor ol li.ql-indent-5 {
    counter-reset: list-6 list-7 list-8 list-9;
}
.ql-editor ol li.ql-indent-6 {
    counter-increment: list-6;
}
.ql-editor ol li.ql-indent-6:before {
    content: counter(list-6, decimal) '. ';
}
.ql-editor ol li.ql-indent-6 {
    counter-reset: list-7 list-8 list-9;
}
.ql-editor ol li.ql-indent-7 {
    counter-increment: list-7;
}
.ql-editor ol li.ql-indent-7:before {
    content: counter(list-7, lower-alpha) '. ';
}
.ql-editor ol li.ql-indent-7 {
    counter-reset: list-8 list-9;
}
.ql-editor ol li.ql-indent-8 {
    counter-increment: list-8;
}
.ql-editor ol li.ql-indent-8:before {
    content: counter(list-8, lower-roman) '. ';
}
.ql-editor ol li.ql-indent-8 {
    counter-reset: list-9;
}
.ql-editor ol li.ql-indent-9 {
    counter-increment: list-9;
}
.ql-editor ol li.ql-indent-9:before {
    content: counter(list-9, decimal) '. ';
}
.ql-editor .ql-indent-1:not(.ql-direction-rtl) {
    padding-left: 3rem;
}
.ql-editor li.ql-indent-1:not(.ql-direction-rtl) {
    padding-left: 4.5rem;
}
.ql-editor .ql-indent-1.ql-direction-rtl.ql-align-right {
    padding-right: 3rem;
}
.ql-editor li.ql-indent-1.ql-direction-rtl.ql-align-right {
    padding-right: 4.5rem;
}
.ql-editor .ql-indent-2:not(.ql-direction-rtl) {
    padding-left: 6rem;
}
.ql-editor li.ql-indent-2:not(.ql-direction-rtl) {
    padding-left: 7.5rem;
}
.ql-editor .ql-indent-2.ql-direction-rtl.ql-align-right {
    padding-right: 6rem;
}
.ql-editor li.ql-indent-2.ql-direction-rtl.ql-align-right {
    padding-right: 7.5rem;
}
.ql-editor .ql-indent-3:not(.ql-direction-rtl) {
    padding-left: 9rem;
}
.ql-editor li.ql-indent-3:not(.ql-direction-rtl) {
    padding-left: 10.5rem;
}
.ql-editor .ql-indent-3.ql-direction-rtl.ql-align-right {
    padding-right: 9rem;
}
.ql-editor li.ql-indent-3.ql-direction-rtl.ql-align-right {
    padding-right: 10.5rem;
}
.ql-editor .ql-indent-4:not(.ql-direction-rtl) {
    padding-left: 12rem;
}
.ql-editor li.ql-indent-4:not(.ql-direction-rtl) {
    padding-left: 13.5rem;
}
.ql-editor .ql-indent-4.ql-direction-rtl.ql-align-right {
    padding-right: 12rem;
}
.ql-editor li.ql-indent-4.ql-direction-rtl.ql-align-right {
    padding-right: 13.5rem;
}
.ql-editor .ql-indent-5:not(.ql-direction-rtl) {
    padding-left: 15rem;
}
.ql-editor li.ql-indent-5:not(.ql-direction-rtl) {
    padding-left: 16.5rem;
}
.ql-editor .ql-indent-5.ql-direction-rtl.ql-align-right {
    padding-right: 15rem;
}
.ql-editor li.ql-indent-5.ql-direction-rtl.ql-align-right {
    padding-right: 16.5rem;
}
.ql-editor .ql-indent-6:not(.ql-direction-rtl) {
    padding-left: 18rem;
}
.ql-editor li.ql-indent-6:not(.ql-direction-rtl) {
    padding-left: 19.5rem;
}
.ql-editor .ql-indent-6.ql-direction-rtl.ql-align-right {
    padding-right: 18rem;
}
.ql-editor li.ql-indent-6.ql-direction-rtl.ql-align-right {
    padding-right: 19.5rem;
}
.ql-editor .ql-indent-7:not(.ql-direction-rtl) {
    padding-left: 21rem;
}
.ql-editor li.ql-indent-7:not(.ql-direction-rtl) {
    padding-left: 22.5rem;
}
.ql-editor .ql-indent-7.ql-direction-rtl.ql-align-right {
    padding-right: 21rem;
}
.ql-editor li.ql-indent-7.ql-direction-rtl.ql-align-right {
    padding-right: 22.5rem;
}
.ql-editor .ql-indent-8:not(.ql-direction-rtl) {
    padding-left: 24rem;
}
.ql-editor li.ql-indent-8:not(.ql-direction-rtl) {
    padding-left: 25.5rem;
}
.ql-editor .ql-indent-8.ql-direction-rtl.ql-align-right {
    padding-right: 24rem;
}
.ql-editor li.ql-indent-8.ql-direction-rtl.ql-align-right {
    padding-right: 25.5rem;
}
.ql-editor .ql-indent-9:not(.ql-direction-rtl) {
    padding-left: 27rem;
}
.ql-editor li.ql-indent-9:not(.ql-direction-rtl) {
    padding-left: 28.5rem;
}
.ql-editor .ql-indent-9.ql-direction-rtl.ql-align-right {
    padding-right: 27rem;
}
.ql-editor li.ql-indent-9.ql-direction-rtl.ql-align-right {
    padding-right: 28.5rem;
}
.ql-editor .ql-video {
    display: block;
    max-width: 100%;
}
.ql-editor .ql-video.ql-align-center {
    margin: 0 auto;
}
.ql-editor .ql-video.ql-align-right {
    margin: 0 0 0 auto;
}
.ql-editor .ql-bg-black {
    background-color: #000;
}
.ql-editor .ql-bg-red {
    background-color: #e60000;
}
.ql-editor .ql-bg-orange {
    background-color: #f90;
}
.ql-editor .ql-bg-yellow {
    background-color: #ff0;
}
.ql-editor .ql-bg-green {
    background-color: #008a00;
}
.ql-editor .ql-bg-blue {
    background-color: #06c;
}
.ql-editor .ql-bg-purple {
    background-color: #93f;
}
.ql-editor .ql-color-white {
    color: #fff;
}
.ql-editor .ql-color-red {
    color: #e60000;
}
.ql-editor .ql-color-orange {
    color: #f90;
}
.ql-editor .ql-color-yellow {
    color: #ff0;
}
.ql-editor .ql-color-green {
    color: #008a00;
}
.ql-editor .ql-color-blue {
    color: #06c;
}
.ql-editor .ql-color-purple {
    color: #93f;
}
.ql-editor .ql-font-serif {
    font-family: Georgia, Times New Roman, serif;
}
.ql-editor .ql-font-monospace {
    font-family: Monaco, Courier New, monospace;
}
.ql-editor .ql-size-small {
    font-size: 0.75rem;
}
.ql-editor .ql-size-large {
    font-size: 1.5rem;
}
.ql-editor .ql-size-huge {
    font-size: 2.5rem;
}
.ql-editor .ql-direction-rtl {
    direction: rtl;
    text-align: inherit;
}
.ql-editor .ql-align-center {
    text-align: center;
}
.ql-editor .ql-align-justify {
    text-align: justify;
}
.ql-editor .ql-align-right {
    text-align: right;
}
.ql-editor.ql-blank::before {
    color: rgba(0, 0, 0, 0.6);
    content: attr(data-placeholder);
    font-style: italic;
    left: 15px;
    pointer-events: none;
    position: absolute;
    right: 15px;
}
.ql-snow.ql-toolbar:after,
.ql-snow .ql-toolbar:after {
    clear: both;
    content: '';
    display: table;
}
.ql-snow.ql-toolbar button,
.ql-snow .ql-toolbar button {
    background: none;
    border: none;
    cursor: pointer;
    display: inline-block;
    float: left;
    height: 24px;
    padding: 3px 5px;
    width: 28px;
}
.ql-snow.ql-toolbar button svg,
.ql-snow .ql-toolbar button svg {
    float: left;
    height: 100%;
}
.ql-snow.ql-toolbar button:active:hover,
.ql-snow .ql-toolbar button:active:hover {
    outline: none;
}
.ql-snow.ql-toolbar input.ql-image[type='file'],
.ql-snow .ql-toolbar input.ql-image[type='file'] {
    display: none;
}
.ql-snow.ql-toolbar button:hover,
.ql-snow .ql-toolbar button:hover,
.ql-snow.ql-toolbar button:focus,
.ql-snow .ql-toolbar button:focus,
.ql-snow.ql-toolbar button.ql-active,
.ql-snow .ql-toolbar button.ql-active,
.ql-snow.ql-toolbar .ql-picker-label:hover,
.ql-snow .ql-toolbar .ql-picker-label:hover,
.ql-snow.ql-toolbar .ql-picker-label.ql-active,
.ql-snow .ql-toolbar .ql-picker-label.ql-active,
.ql-snow.ql-toolbar .ql-picker-item:hover,
.ql-snow .ql-toolbar .ql-picker-item:hover,
.ql-snow.ql-toolbar .ql-picker-item.ql-selected,
.ql-snow .ql-toolbar .ql-picker-item.ql-selected {
    color: #06c;
}
.ql-snow.ql-toolbar button:hover .ql-fill,
.ql-snow .ql-toolbar button:hover .ql-fill,
.ql-snow.ql-toolbar button:focus .ql-fill,
.ql-snow .ql-toolbar button:focus .ql-fill,
.ql-snow.ql-toolbar button.ql-active .ql-fill,
.ql-snow .ql-toolbar button.ql-active .ql-fill,
.ql-snow.ql-toolbar .ql-picker-label:hover .ql-fill,
.ql-snow .ql-toolbar .ql-picker-label:hover .ql-fill,
.ql-snow.ql-toolbar .ql-picker-label.ql-active .ql-fill,
.ql-snow .ql-toolbar .ql-picker-label.ql-active .ql-fill,
.ql-snow.ql-toolbar .ql-picker-item:hover .ql-fill,
.ql-snow .ql-toolbar .ql-picker-item:hover .ql-fill,
.ql-snow.ql-toolbar .ql-picker-item.ql-selected .ql-fill,
.ql-snow .ql-toolbar .ql-picker-item.ql-selected .ql-fill,
.ql-snow.ql-toolbar button:hover .ql-stroke.ql-fill,
.ql-snow .ql-toolbar button:hover .ql-stroke.ql-fill,
.ql-snow.ql-toolbar button:focus .ql-stroke.ql-fill,
.ql-snow .ql-toolbar button:focus .ql-stroke.ql-fill,
.ql-snow.ql-toolbar button.ql-active .ql-stroke.ql-fill,
.ql-snow .ql-toolbar button.ql-active .ql-stroke.ql-fill,
.ql-snow.ql-toolbar .ql-picker-label:hover .ql-stroke.ql-fill,
.ql-snow .ql-toolbar .ql-picker-label:hover .ql-stroke.ql-fill,
.ql-snow.ql-toolbar .ql-picker-label.ql-active .ql-stroke.ql-fill,
.ql-snow .ql-toolbar .ql-picker-label.ql-active .ql-stroke.ql-fill,
.ql-snow.ql-toolbar .ql-picker-item:hover .ql-stroke.ql-fill,
.ql-snow .ql-toolbar .ql-picker-item:hover .ql-stroke.ql-fill,
.ql-snow.ql-toolbar .ql-picker-item.ql-selected .ql-stroke.ql-fill,
.ql-snow .ql-toolbar .ql-picker-item.ql-selected .ql-stroke.ql-fill {
    fill: #06c;
}
.ql-snow.ql-toolbar button:hover .ql-stroke,
.ql-snow .ql-toolbar button:hover .ql-stroke,
.ql-snow.ql-toolbar button:focus .ql-stroke,
.ql-snow .ql-toolbar button:focus .ql-stroke,
.ql-snow.ql-toolbar button.ql-active .ql-stroke,
.ql-snow .ql-toolbar button.ql-active .ql-stroke,
.ql-snow.ql-toolbar .ql-picker-label:hover .ql-stroke,
.ql-snow .ql-toolbar .ql-picker-label:hover .ql-stroke,
.ql-snow.ql-toolbar .ql-picker-label.ql-active .ql-stroke,
.ql-snow .ql-toolbar .ql-picker-label.ql-active .ql-stroke,
.ql-snow.ql-toolbar .ql-picker-item:hover .ql-stroke,
.ql-snow .ql-toolbar .ql-picker-item:hover .ql-stroke,
.ql-snow.ql-toolbar .ql-picker-item.ql-selected .ql-stroke,
.ql-snow .ql-toolbar .ql-picker-item.ql-selected .ql-stroke,
.ql-snow.ql-toolbar button:hover .ql-stroke-miter,
.ql-snow .ql-toolbar button:hover .ql-stroke-miter,
.ql-snow.ql-toolbar button:focus .ql-stroke-miter,
.ql-snow .ql-toolbar button:focus .ql-stroke-miter,
.ql-snow.ql-toolbar button.ql-active .ql-stroke-miter,
.ql-snow .ql-toolbar button.ql-active .ql-stroke-miter,
.ql-snow.ql-toolbar .ql-picker-label:hover .ql-stroke-miter,
.ql-snow .ql-toolbar .ql-picker-label:hover .ql-stroke-miter,
.ql-snow.ql-toolbar .ql-picker-label.ql-active .ql-stroke-miter,
.ql-snow .ql-toolbar .ql-picker-label.ql-active .ql-stroke-miter,
.ql-snow.ql-toolbar .ql-picker-item:hover .ql-stroke-miter,
.ql-snow .ql-toolbar .ql-picker-item:hover .ql-stroke-miter,
.ql-snow.ql-toolbar .ql-picker-item.ql-selected .ql-stroke-miter,
.ql-snow .ql-toolbar .ql-picker-item.ql-selected .ql-stroke-miter {
    stroke: #06c;
}
@media (pointer: coarse) {
    .ql-snow.ql-toolbar button:hover:not(.ql-active),
    .ql-snow .ql-toolbar button:hover:not(.ql-active) {
        color: #444;
    }
    .ql-snow.ql-toolbar button:hover:not(.ql-active) .ql-fill,
    .ql-snow .ql-toolbar button:hover:not(.ql-active) .ql-fill,
    .ql-snow.ql-toolbar button:hover:not(.ql-active) .ql-stroke.ql-fill,
    .ql-snow .ql-toolbar button:hover:not(.ql-active) .ql-stroke.ql-fill {
        fill: #444;
    }
    .ql-snow.ql-toolbar button:hover:not(.ql-active) .ql-stroke,
    .ql-snow .ql-toolbar button:hover:not(.ql-active) .ql-stroke,
    .ql-snow.ql-toolbar button:hover:not(.ql-active) .ql-stroke-miter,
    .ql-snow .ql-toolbar button:hover:not(.ql-active) .ql-stroke-miter {
        stroke: #444;
    }
}
.ql-snow {
    box-sizing: border-box;
}
.ql-snow * {
    box-sizing: border-box;
}
.ql-snow .ql-hidden {
    display: none;
}
.ql-snow .ql-out-bottom,
.ql-snow .ql-out-top {
    visibility: hidden;
}
.ql-snow .ql-tooltip {
    position: absolute;
    transform: translateY(10px);
}
.ql-snow .ql-tooltip a {
    cursor: pointer;
    text-decoration: none;
}
.ql-snow .ql-tooltip.ql-flip {
    transform: translateY(-10px);
}
.ql-snow .ql-formats {
    display: inline-block;
    vertical-align: middle;
}
.ql-snow .ql-formats:after {
    clear: both;
    content: '';
    display: table;
}
.ql-snow .ql-stroke {
    fill: none;
    stroke: #444;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 2;
}
.ql-snow .ql-stroke-miter {
    fill: none;
    stroke: #444;
    stroke-miterlimit: 10;
    stroke-width: 2;
}
.ql-snow .ql-fill,
.ql-snow .ql-stroke.ql-fill {
    fill: #444;
}
.ql-snow .ql-empty {
    fill: none;
}
.ql-snow .ql-even {
    fill-rule: evenodd;
}
.ql-snow .ql-thin,
.ql-snow .ql-stroke.ql-thin {
    stroke-width: 1;
}
.ql-snow .ql-transparent {
    opacity: 0.4;
}
.ql-snow .ql-direction svg:last-child {
    display: none;
}
.ql-snow .ql-direction.ql-active svg:last-child {
    display: inline;
}
.ql-snow .ql-direction.ql-active svg:first-child {
    display: none;
}
.ql-snow .ql-editor h1 {
    font-size: 2rem;
}
.ql-snow .ql-editor h2 {
    font-size: 1.5rem;
}
.ql-snow .ql-editor h3 {
    font-size: 1.17rem;
}
.ql-snow .ql-editor h4 {
    font-size: 1rem;
}
.ql-snow .ql-editor h5 {
    font-size: 0.83rem;
}
.ql-snow .ql-editor h6 {
    font-size: 0.67rem;
}
.ql-snow .ql-editor a {
    text-decoration: underline;
}
.ql-snow .ql-editor blockquote {
    border-left: 4px solid #ccc;
    margin-bottom: 5px;
    margin-top: 5px;
    padding-left: 16px;
}
.ql-snow .ql-editor code,
.ql-snow .ql-editor pre {
    background-color: #f0f0f0;
    border-radius: 3px;
}
.ql-snow .ql-editor pre {
    white-space: pre-wrap;
    margin-bottom: 5px;
    margin-top: 5px;
    padding: 5px 10px;
}
.ql-snow .ql-editor code {
    font-size: 85%;
    padding: 2px 4px;
}
.ql-snow .ql-editor pre.ql-syntax {
    background-color: #23241f;
    color: #f8f8f2;
    overflow: visible;
}
.ql-snow .ql-editor img {
    max-width: 100%;
}
.ql-snow .ql-picker {
    color: #444;
    display: inline-block;
    float: left;
    font-size: 14px;
    font-weight: 500;
    height: 24px;
    position: relative;
    vertical-align: middle;
}
.ql-snow .ql-picker-label {
    cursor: pointer;
    display: inline-block;
    height: 100%;
    padding-left: 8px;
    padding-right: 2px;
    position: relative;
    width: 100%;
}
.ql-snow .ql-picker-label::before {
    display: inline-block;
    line-height: 22px;
}
.ql-snow .ql-picker-options {
    background-color: #fff;
    display: none;
    min-width: 100%;
    padding: 4px 8px;
    position: absolute;
    white-space: nowrap;
}
.ql-snow .ql-picker-options .ql-picker-item {
    cursor: pointer;
    display: block;
    padding-bottom: 5px;
    padding-top: 5px;
}
.ql-snow .ql-picker.ql-expanded .ql-picker-label {
    color: #ccc;
    z-index: 2;
}
.ql-snow .ql-picker.ql-expanded .ql-picker-label .ql-fill {
    fill: #ccc;
}
.ql-snow .ql-picker.ql-expanded .ql-picker-label .ql-stroke {
    stroke: #ccc;
}
.ql-snow .ql-picker.ql-expanded .ql-picker-options {
    display: block;
    margin-top: -1px;
    top: 100%;
    z-index: 1;
}
.ql-snow .ql-color-picker,
.ql-snow .ql-icon-picker {
    width: 28px;
}
.ql-snow .ql-color-picker .ql-picker-label,
.ql-snow .ql-icon-picker .ql-picker-label {
    padding: 2px 4px;
}
.ql-snow .ql-color-picker .ql-picker-label svg,
.ql-snow .ql-icon-picker .ql-picker-label svg {
    right: 4px;
}
.ql-snow .ql-icon-picker .ql-picker-options {
    padding: 4px 0px;
}
.ql-snow .ql-icon-picker .ql-picker-item {
    height: 24px;
    width: 24px;
    padding: 2px 4px;
}
.ql-snow .ql-color-picker .ql-picker-options {
    padding: 3px 5px;
    width: 152px;
}
.ql-snow .ql-color-picker .ql-picker-item {
    border: 1px solid transparent;
    float: left;
    height: 16px;
    margin: 2px;
    padding: 0px;
    width: 16px;
}
.ql-snow .ql-picker:not(.ql-color-picker):not(.ql-icon-picker) svg {
    position: absolute;
    margin-top: -9px;
    right: 0;
    top: 50%;
    width: 18px;
}
.ql-snow .ql-picker.ql-header .ql-picker-label[data-label]:not([data-label=''])::before,
.ql-snow .ql-picker.ql-font .ql-picker-label[data-label]:not([data-label=''])::before,
.ql-snow .ql-picker.ql-size .ql-picker-label[data-label]:not([data-label=''])::before,
.ql-snow .ql-picker.ql-header .ql-picker-item[data-label]:not([data-label=''])::before,
.ql-snow .ql-picker.ql-font .ql-picker-item[data-label]:not([data-label=''])::before,
.ql-snow .ql-picker.ql-size .ql-picker-item[data-label]:not([data-label=''])::before {
    content: attr(data-label);
}
.ql-snow .ql-picker.ql-header {
    width: 98px;
}
.ql-snow .ql-picker.ql-header .ql-picker-label::before,
.ql-snow .ql-picker.ql-header .ql-picker-item::before {
    content: 'Normal';
}
.ql-snow .ql-picker.ql-header .ql-picker-label[data-value='1']::before,
.ql-snow .ql-picker.ql-header .ql-picker-item[data-value='1']::before {
    content: 'Heading 1';
}
.ql-snow .ql-picker.ql-header .ql-picker-label[data-value='2']::before,
.ql-snow .ql-picker.ql-header .ql-picker-item[data-value='2']::before {
    content: 'Heading 2';
}
.ql-snow .ql-picker.ql-header .ql-picker-label[data-value='3']::before,
.ql-snow .ql-picker.ql-header .ql-picker-item[data-value='3']::before {
    content: 'Heading 3';
}
.ql-snow .ql-picker.ql-header .ql-picker-label[data-value='4']::before,
.ql-snow .ql-picker.ql-header .ql-picker-item[data-value='4']::before {
    content: 'Heading 4';
}
.ql-snow .ql-picker.ql-header .ql-picker-label[data-value='5']::before,
.ql-snow .ql-picker.ql-header .ql-picker-item[data-value='5']::before {
    content: 'Heading 5';
}
.ql-snow .ql-picker.ql-header .ql-picker-label[data-value='6']::before,
.ql-snow .ql-picker.ql-header .ql-picker-item[data-value='6']::before {
    content: 'Heading 6';
}
.ql-snow .ql-picker.ql-header .ql-picker-item[data-value='1']::before {
    font-size: 2rem;
}
.ql-snow .ql-picker.ql-header .ql-picker-item[data-value='2']::before {
    font-size: 1.5rem;
}
.ql-snow .ql-picker.ql-header .ql-picker-item[data-value='3']::before {
    font-size: 1.17rem;
}
.ql-snow .ql-picker.ql-header .ql-picker-item[data-value='4']::before {
    font-size: 1rem;
}
.ql-snow .ql-picker.ql-header .ql-picker-item[data-value='5']::before {
    font-size: 0.83rem;
}
.ql-snow .ql-picker.ql-header .ql-picker-item[data-value='6']::before {
    font-size: 0.67rem;
}
.ql-snow .ql-picker.ql-font {
    width: 108px;
}
.ql-snow .ql-picker.ql-font .ql-picker-label::before,
.ql-snow .ql-picker.ql-font .ql-picker-item::before {
    content: 'Sans Serif';
}
.ql-snow .ql-picker.ql-font .ql-picker-label[data-value='serif']::before,
.ql-snow .ql-picker.ql-font .ql-picker-item[data-value='serif']::before {
    content: 'Serif';
}
.ql-snow .ql-picker.ql-font .ql-picker-label[data-value='monospace']::before,
.ql-snow .ql-picker.ql-font .ql-picker-item[data-value='monospace']::before {
    content: 'Monospace';
}
.ql-snow .ql-picker.ql-font .ql-picker-item[data-value='serif']::before {
    font-family: Georgia, Times New Roman, serif;
}
.ql-snow .ql-picker.ql-font .ql-picker-item[data-value='monospace']::before {
    font-family: Monaco, Courier New, monospace;
}
.ql-snow .ql-picker.ql-size {
    width: 98px;
}
.ql-snow .ql-picker.ql-size .ql-picker-label::before,
.ql-snow .ql-picker.ql-size .ql-picker-item::before {
    content: 'Normal';
}
.ql-snow .ql-picker.ql-size .ql-picker-label[data-value='small']::before,
.ql-snow .ql-picker.ql-size .ql-picker-item[data-value='small']::before {
    content: 'Small';
}
.ql-snow .ql-picker.ql-size .ql-picker-label[data-value='large']::before,
.ql-snow .ql-picker.ql-size .ql-picker-item[data-value='large']::before {
    content: 'Large';
}
.ql-snow .ql-picker.ql-size .ql-picker-label[data-value='huge']::before,
.ql-snow .ql-picker.ql-size .ql-picker-item[data-value='huge']::before {
    content: 'Huge';
}
.ql-snow .ql-picker.ql-size .ql-picker-item[data-value='small']::before {
    font-size: 10px;
}
.ql-snow .ql-picker.ql-size .ql-picker-item[data-value='large']::before {
    font-size: 18px;
}
.ql-snow .ql-picker.ql-size .ql-picker-item[data-value='huge']::before {
    font-size: 32px;
}
.ql-snow .ql-color-picker.ql-background .ql-picker-item {
    background-color: #fff;
}
.ql-snow .ql-color-picker.ql-color .ql-picker-item {
    background-color: #000;
}
.ql-toolbar.ql-snow {
    border: 1px solid #ccc;
    box-sizing: border-box;
    font-family: 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif;
    padding: 8px;
}
.ql-toolbar.ql-snow .ql-formats {
    margin-right: 15px;
}
.ql-toolbar.ql-snow .ql-picker-label {
    border: 1px solid transparent;
}
.ql-toolbar.ql-snow .ql-picker-options {
    border: 1px solid transparent;
    box-shadow: rgba(0, 0, 0, 0.2) 0 2px 8px;
}
.ql-toolbar.ql-snow .ql-picker.ql-expanded .ql-picker-label {
    border-color: #ccc;
}
.ql-toolbar.ql-snow .ql-picker.ql-expanded .ql-picker-options {
    border-color: #ccc;
}
.ql-toolbar.ql-snow .ql-color-picker .ql-picker-item.ql-selected,
.ql-toolbar.ql-snow .ql-color-picker .ql-picker-item:hover {
    border-color: #000;
}
.ql-toolbar.ql-snow + .ql-container.ql-snow {
    border-top: 0px;
}
.ql-snow .ql-tooltip {
    background-color: #fff;
    border: 1px solid #ccc;
    box-shadow: 0px 0px 5px #ddd;
    color: #444;
    padding: 5px 12px;
    white-space: nowrap;
}
.ql-snow .ql-tooltip::before {
    content: 'Visit URL:';
    line-height: 26px;
    margin-right: 8px;
}
.ql-snow .ql-tooltip input[type='text'] {
    display: none;
    border: 1px solid #ccc;
    font-size: 13px;
    height: 26px;
    margin: 0px;
    padding: 3px 5px;
    width: 170px;
}
.ql-snow .ql-tooltip a.ql-preview {
    display: inline-block;
    max-width: 200px;
    overflow-x: hidden;
    text-overflow: ellipsis;
    vertical-align: top;
}
.ql-snow .ql-tooltip a.ql-action::after {
    border-right: 1px solid #ccc;
    content: 'Edit';
    margin-left: 16px;
    padding-right: 8px;
}
.ql-snow .ql-tooltip a.ql-remove::before {
    content: 'Remove';
    margin-left: 8px;
}
.ql-snow .ql-tooltip a {
    line-height: 26px;
}
.ql-snow .ql-tooltip.ql-editing a.ql-preview,
.ql-snow .ql-tooltip.ql-editing a.ql-remove {
    display: none;
}
.ql-snow .ql-tooltip.ql-editing input[type='text'] {
    display: inline-block;
}
.ql-snow .ql-tooltip.ql-editing a.ql-action::after {
    border-right: 0px;
    content: 'Save';
    padding-right: 0px;
}
.ql-snow .ql-tooltip[data-mode='link']::before {
    content: 'Enter link:';
}
.ql-snow .ql-tooltip[data-mode='formula']::before {
    content: 'Enter formula:';
}
.ql-snow .ql-tooltip[data-mode='video']::before {
    content: 'Enter video:';
}
.ql-snow a {
    color: #06c;
}
.ql-container.ql-snow {
    border: 1px solid #ccc;
}
`,Y={root:"p-editor-container",toolbar:"p-editor-toolbar",formats:"ql-formats",header:"ql-header",font:"ql-font",bold:"ql-bold",italic:"ql-italic",underline:"ql-underline",color:"ql-color",background:"ql-background",list:"ql-list",select:"ql-align",link:"ql-link",image:"ql-image",codeBlock:"ql-code-block",clean:"ql-clean",content:"p-editor-content"},G=U(F,{name:"editor",manual:!0}),J=G.load,W={name:"BaseEditor",extends:j,props:{modelValue:String,placeholder:String,readonly:Boolean,formats:Array,editorStyle:null,modules:null},css:{classes:Y,loadStyle:J},provide:function(){return{$parentInstance:this}}};function w(l){"@babel/helpers - typeof";return w=typeof Symbol=="function"&&typeof Symbol.iterator=="symbol"?function(n){return typeof n}:function(n){return n&&typeof Symbol=="function"&&n.constructor===Symbol&&n!==Symbol.prototype?"symbol":typeof n},w(l)}function E(l,n){var s=Object.keys(l);if(Object.getOwnPropertySymbols){var q=Object.getOwnPropertySymbols(l);n&&(q=q.filter(function(c){return Object.getOwnPropertyDescriptor(l,c).enumerable})),s.push.apply(s,q)}return s}function X(l){for(var n=1;n<arguments.length;n++){var s=arguments[n]!=null?arguments[n]:{};n%2?E(Object(s),!0).forEach(function(q){Z(l,q,s[q])}):Object.getOwnPropertyDescriptors?Object.defineProperties(l,Object.getOwnPropertyDescriptors(s)):E(Object(s)).forEach(function(q){Object.defineProperty(l,q,Object.getOwnPropertyDescriptor(s,q))})}return l}function Z(l,n,s){return n=ll(n),n in l?Object.defineProperty(l,n,{value:s,enumerable:!0,configurable:!0,writable:!0}):l[n]=s,l}function ll(l){var n=nl(l,"string");return w(n)==="symbol"?n:String(n)}function nl(l,n){if(w(l)!=="object"||l===null)return l;var s=l[Symbol.toPrimitive];if(s!==void 0){var q=s.call(l,n||"default");if(w(q)!=="object")return q;throw new TypeError("@@toPrimitive must return a primitive value.")}return(n==="string"?String:Number)(l)}var $=function(){try{return window.Quill}catch{return null}}(),g={name:"Editor",extends:W,emits:["update:modelValue","text-change","selection-change","load"],data:function(){return{reRenderColorKey:0}},quill:null,watch:{modelValue:function(n,s){n!==s&&this.quill&&!this.quill.hasFocus()&&(this.reRenderColorKey++,this.renderValue(n))}},mounted:function(){var n=this,s={modules:X({toolbar:this.$refs.toolbarElement},this.modules),readOnly:this.readonly,theme:"snow",formats:this.formats,placeholder:this.placeholder};$?(this.quill=new $(this.$refs.editorElement,s),this.initQuill(),this.handleLoad()):C(()=>import("./quill-642a67d5.js").then(q=>q.q),["assets/quill-642a67d5.js","assets/index-cbbedec6.js","assets/index-2197c374.css"]).then(function(q){q&&T.isExist(n.$refs.editorElement)&&(q.default?n.quill=new q.default(n.$refs.editorElement,s):n.quill=new q(n.$refs.editorElement,s),n.initQuill())}).then(function(){n.handleLoad()})},beforeUnmount:function(){this.quill=null},methods:{renderValue:function(n){this.quill&&(n?this.quill.setContents(this.quill.clipboard.convert(n)):this.quill.setText(""))},initQuill:function(){var n=this;this.renderValue(this.modelValue),this.quill.on("text-change",function(s,q,c){if(c==="user"){var o=n.$refs.editorElement.children[0].innerHTML,b=n.quill.getText().trim();o==="<p><br></p>"&&(o=""),n.$emit("update:modelValue",o),n.$emit("text-change",{htmlValue:o,textValue:b,delta:s,source:c,instance:n.quill})}}),this.quill.on("selection-change",function(s,q,c){var o=n.$refs.editorElement.children[0].innerHTML,b=n.quill.getText().trim();n.$emit("selection-change",{htmlValue:o,textValue:b,range:s,oldRange:q,source:c,instance:n.quill})})},handleLoad:function(){this.quill&&this.quill.getModule("toolbar")&&this.$emit("load",{instance:this.quill})}}};function el(l,n,s,q,c,o){return k(),h("div",a({class:l.cx("root")},l.ptm("root"),{"data-pc-name":"editor"}),[e("div",a({ref:"toolbarElement",class:l.cx("toolbar")},l.ptm("toolbar")),[H(l.$slots,"toolbar",{},function(){return[e("span",a({class:l.cx("formats")},l.ptm("formats")),[e("select",a({class:l.cx("header"),defaultValue:"0"},l.ptm("header")),[e("option",a({value:"1"},l.ptm("option")),"Heading",16),e("option",a({value:"2"},l.ptm("option")),"Subheading",16),e("option",a({value:"0"},l.ptm("option")),"Normal",16)],16),e("select",a({class:l.cx("font")},l.ptm("font")),[e("option",B(N(l.ptm("option"))),null,16),e("option",a({value:"serif"},l.ptm("option")),null,16),e("option",a({value:"monospace"},l.ptm("option")),null,16)],16)],16),e("span",a({class:l.cx("formats")},l.ptm("formats")),[e("button",a({class:l.cx("bold"),type:"button"},l.ptm("bold")),null,16),e("button",a({class:l.cx("italic"),type:"button"},l.ptm("italic")),null,16),e("button",a({class:l.cx("underline"),type:"button"},l.ptm("underline")),null,16)],16),(k(),h("span",a({key:c.reRenderColorKey,class:l.cx("formats")},l.ptm("formats")),[e("select",a({class:l.cx("color")},l.ptm("color")),null,16),e("select",a({class:l.cx("background")},l.ptm("background")),null,16)],16)),e("span",a({class:l.cx("formats")},l.ptm("formats")),[e("button",a({class:l.cx("list"),value:"ordered",type:"button"},l.ptm("list")),null,16),e("button",a({class:l.cx("list"),value:"bullet",type:"button"},l.ptm("list")),null,16),e("select",a({class:l.cx("select")},l.ptm("select")),[e("option",a({defaultValue:""},l.ptm("option")),null,16),e("option",a({value:"center"},l.ptm("option")),null,16),e("option",a({value:"right"},l.ptm("option")),null,16),e("option",a({value:"justify"},l.ptm("option")),null,16)],16)],16),e("span",a({class:l.cx("formats")},l.ptm("formats")),[e("button",a({class:l.cx("link"),type:"button"},l.ptm("link")),null,16),e("button",a({class:l.cx("image"),type:"button"},l.ptm("image")),null,16),e("button",a({class:l.cx("codeBlock"),type:"button"},l.ptm("codeBlock")),null,16)],16),e("span",a({class:l.cx("formats")},l.ptm("formats")),[e("button",a({class:l.cx("clean"),type:"button"},l.ptm("clean")),null,16)],16)]})],16),e("div",a({ref:"editorElement",class:l.cx("content"),style:l.editorStyle},l.ptm("content")),null,16)],16)}g.render=el;const tl={class:"mx-auto p-4 max-w-6xl"},ol={class:"text-2xl font-bold"},il={key:0,class:"flex justify-center py-12"},rl={key:1,class:"space-y-10"},al={class:"grid grid-cols-1 md:grid-cols-2 gap-6"},sl={class:"block mb-2 font-medium"},ql={class:"block mb-2 font-medium"},dl={class:"block mb-2 font-medium"},cl={class:"md:col-span-2"},pl={class:"block mb-2 font-medium"},ul={class:"border-t pt-8"},bl={class:"text-xl font-semibold mb-6 text-indigo-600"},ml={class:"grid grid-cols-1 md:grid-cols-2 gap-6"},fl={class:"md:col-span-2"},gl={class:"border-t pt-8"},kl={class:"text-xl font-semibold mb-6 text-indigo-600"},hl={class:"mb-10"},wl={class:"block mb-3 font-medium text-lg"},vl={class:"mb-10"},yl={class:"block mb-3 font-medium text-lg"},xl={class:"border-t pt-8"},_l={class:"text-xl font-semibold mb-6 text-indigo-600"},Vl={class:"mb-10"},zl={class:"block mb-3 font-medium text-lg"},Sl={class:"mb-10"},Pl={class:"block mb-3 font-medium text-lg"},El={class:"flex justify-end mt-12"},$l={__name:"update",setup(l){const{t:n}=R(),s=D(),q=I(),c=z(!1),o=z({order_tax:"",address:"",phone:"",email:"",facebook:"",instagram:"",youtube:"",snapchat:"",tiktok:"",privacy_policy_ar:"",privacy_policy_en:"",terms_conditions_ar:"",terms_conditions_en:""}),b={modules:{toolbar:[[{header:[1,2,3,!1]}],["bold","italic","underline"],[{list:"ordered"},{list:"bullet"}],[{align:[]}],["link"],["clean"]]}};M(()=>{x()});const x=async()=>{c.value=!0;try{const m=await S.get("api/setting",{params:{code:s.query.code,realmId:s.query.realmId}});if(m.data.is_success){const t=m.data.data,r={order_tax:"order_tax",address:"address",phone:"phone",email:"email",facebook:"facebook",instagram:"instagram",youtube:"youtube",snapchat:"snapchat",tiktok:"tiktok",privacy_policy_ar:"privacy_policy_ar",privacy_policy_en:"privacy_policy_en",terms_conditions_ar:"terms_conditions_ar",terms_conditions_en:"terms_conditions_en"};t.forEach(y=>{const v=r[y.key];v&&o.value.hasOwnProperty(v)&&(o.value[v]=y.value||"")}),q.add({severity:"success",summary:n("quickBooks.success"),detail:n("quickBooks.successContent"),life:3e3})}}catch{q.add({severity:"error",summary:n("quickBooks.error"),detail:n("quickBooks.erorrContent"),life:5e3})}finally{c.value=!1}},O=async()=>{var m,t;c.value=!0;try{const r=new FormData;["order_tax","address","phone","email","facebook","instagram","youtube","snapchat","tiktok","privacy_policy_ar","privacy_policy_en","terms_conditions_ar","terms_conditions_en"].forEach((_,V)=>{r.append(`data[${V}][key]`,_),r.append(`data[${V}][value]`,o.value[_]||"")}),(await S.post("api/setting",r,{headers:{"Content-Type":"multipart/form-data"}})).data.is_success&&(q.add({severity:"success",summary:n("settings.updateSuccess"),detail:n("settings.settingsUpdated"),life:4e3}),await x())}catch(r){q.add({severity:"error",summary:n("settings.updateFailed"),detail:((t=(m=r.response)==null?void 0:m.data)==null?void 0:t.message)||n("settings.updateError"),life:6e3})}finally{c.value=!1}};return(m,t)=>(k(),h("div",tl,[d(i(A),null,{title:P(()=>[e("h2",ol,p(i(n)("settings.title")),1)]),content:P(()=>[c.value?(k(),h("div",il,[d(i(Q),{style:{width:"60px",height:"60px"}})])):(k(),h("div",rl,[e("div",al,[e("div",null,[e("label",sl,p(i(n)("settings.order_tax")),1),d(i(u),{modelValue:o.value.order_tax,"onUpdate:modelValue":t[0]||(t[0]=r=>o.value.order_tax=r),placeholder:i(n)("settings.order_taxPlaceholder"),class:"w-full"},null,8,["modelValue","placeholder"])]),e("div",null,[e("label",ql,p(i(n)("settings.phone")),1),d(i(u),{modelValue:o.value.phone,"onUpdate:modelValue":t[1]||(t[1]=r=>o.value.phone=r),placeholder:i(n)("settings.phonePlaceholder"),class:"w-full"},null,8,["modelValue","placeholder"])]),e("div",null,[e("label",dl,p(i(n)("settings.email")),1),d(i(u),{modelValue:o.value.email,"onUpdate:modelValue":t[2]||(t[2]=r=>o.value.email=r),type:"email",placeholder:"contact@company.com",class:"w-full"},null,8,["modelValue"])]),e("div",cl,[e("label",pl,p(i(n)("settings.address")),1),d(i(u),{modelValue:o.value.address,"onUpdate:modelValue":t[3]||(t[3]=r=>o.value.address=r),placeholder:i(n)("settings.addressPlaceholder"),class:"w-full"},null,8,["modelValue","placeholder"])])]),e("div",ul,[e("h3",bl,p(i(n)("settings.socialLinks")),1),e("div",ml,[e("div",null,[t[13]||(t[13]=e("label",{class:"block mb-2 font-medium flex items-center gap-2"},[e("i",{class:"pi pi-facebook text-blue-600"}),f(" Facebook ")],-1)),d(i(u),{modelValue:o.value.facebook,"onUpdate:modelValue":t[4]||(t[4]=r=>o.value.facebook=r),placeholder:"https://facebook.com/yourpage",class:"w-full"},null,8,["modelValue"])]),e("div",null,[t[14]||(t[14]=e("label",{class:"block mb-2 font-medium flex items-center gap-2"},[e("i",{class:"pi pi-instagram text-pink-600"}),f(" Instagram ")],-1)),d(i(u),{modelValue:o.value.instagram,"onUpdate:modelValue":t[5]||(t[5]=r=>o.value.instagram=r),placeholder:"https://instagram.com/yourhandle",class:"w-full"},null,8,["modelValue"])]),e("div",null,[t[15]||(t[15]=e("label",{class:"block mb-2 font-medium flex items-center gap-2"},[e("i",{class:"pi pi-youtube text-red-600"}),f(" YouTube ")],-1)),d(i(u),{modelValue:o.value.youtube,"onUpdate:modelValue":t[6]||(t[6]=r=>o.value.youtube=r),placeholder:"https://youtube.com/c/yourchannel",class:"w-full"},null,8,["modelValue"])]),e("div",null,[t[16]||(t[16]=e("label",{class:"block mb-2 font-medium flex items-center gap-2"},[e("i",{class:"pi pi-snapchat text-yellow-400"}),f(" Snapchat ")],-1)),d(i(u),{modelValue:o.value.snapchat,"onUpdate:modelValue":t[7]||(t[7]=r=>o.value.snapchat=r),placeholder:"https://snapchat.com/add/username",class:"w-full"},null,8,["modelValue"])]),e("div",fl,[t[17]||(t[17]=e("label",{class:"block mb-2 font-medium flex items-center gap-2"},[e("i",{class:"pi pi-tiktok text-black"}),f(" TikTok ")],-1)),d(i(u),{modelValue:o.value.tiktok,"onUpdate:modelValue":t[8]||(t[8]=r=>o.value.tiktok=r),placeholder:"https://tiktok.com/@yourusername",class:"w-full"},null,8,["modelValue"])])])]),e("div",gl,[e("h3",kl,p(i(n)("settings.privacyPolicy")),1),e("div",hl,[e("label",wl,p(i(n)("settings.privacy_policy_ar")),1),d(i(g),{modelValue:o.value.privacy_policy_ar,"onUpdate:modelValue":t[9]||(t[9]=r=>o.value.privacy_policy_ar=r),placeholder:i(n)("settings.privacy_policy_arPlaceholder"),editorStyle:"min-height: 320px",formats:["header","bold","italic","underline","list","bullet","link","align"],modules:b.modules},null,8,["modelValue","placeholder","modules"])]),e("div",vl,[e("label",yl,p(i(n)("settings.privacy_policy_en")),1),d(i(g),{modelValue:o.value.privacy_policy_en,"onUpdate:modelValue":t[10]||(t[10]=r=>o.value.privacy_policy_en=r),placeholder:i(n)("settings.privacy_policy_enPlaceholder"),editorStyle:"min-height: 320px",formats:["header","bold","italic","underline","list","bullet","link","align"],modules:b.modules},null,8,["modelValue","placeholder","modules"])])]),e("div",xl,[e("h3",_l,p(i(n)("settings.termsConditions")),1),e("div",Vl,[e("label",zl,p(i(n)("settings.terms_conditions_ar")),1),d(i(g),{modelValue:o.value.terms_conditions_ar,"onUpdate:modelValue":t[11]||(t[11]=r=>o.value.terms_conditions_ar=r),placeholder:i(n)("settings.terms_conditions_arPlaceholder"),editorStyle:"min-height: 320px",formats:["header","bold","italic","underline","list","bullet","link","align"],modules:b.modules},null,8,["modelValue","placeholder","modules"])]),e("div",Sl,[e("label",Pl,p(i(n)("settings.terms_conditions_en")),1),d(i(g),{modelValue:o.value.terms_conditions_en,"onUpdate:modelValue":t[12]||(t[12]=r=>o.value.terms_conditions_en=r),placeholder:i(n)("settings.terms_conditions_enPlaceholder"),editorStyle:"min-height: 320px",formats:["header","bold","italic","underline","list","bullet","link","align"],modules:b.modules},null,8,["modelValue","placeholder","modules"])])]),e("div",El,[d(i(K),{label:i(n)("settings.updateButton"),icon:"pi pi-check",loading:c.value,class:"px-8 py-3 text-lg",onClick:O},null,8,["label","loading"])])]))]),_:1})]))}},Ul=L($l,[["__scopeId","data-v-634a2a44"]]);export{Ul as default};
