export const rocketActionIcon = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
  {/* 按钮背景 */}
  <circle cx="10" cy="10" r="9" fill="currentColor" opacity="0.1">
    <animate
      attributeName="opacity"
      values="0.1;0.15;0.1"
      dur="2s"
      repeatCount="indefinite"
    />
  </circle>

  <g transform="translate(10 10) rotate(45) translate(-10 -10)">
    {/* 火箭主体 - 放大尺寸 */}
    <path d="M10 3C10.8 3 11.6 6 11.6 9.5C11.6 13 10.8 15.5 10 15.5C9.2 15.5 8.4 13 8.4 9.5C8.4 6 9.2 3 10 3Z" 
      fill="currentColor"
    >
      <animate
        attributeName="opacity"
        values="0.85;1;0.85"
        dur="2s"
        repeatCount="indefinite"
      />
    </path>
    
    {/* 火箭窗户 */}
    <circle cx="10" cy="8" r="0.8" 
      fill="currentColor" 
      opacity="0.3"
    />

    {/* 火箭翼 */}
    <path d="M8.4 9.5C8.4 9.5 6.2 10 6.2 10.5C6.2 11 8.4 11.5 8.4 11.5C8.4 11.5 9.2 15.5 10 15.5C10.8 15.5 11.6 11.5 11.6 11.5C11.6 11.5 13.8 11 13.8 10.5C13.8 10 11.6 9.5 11.6 9.5C11.6 9.5 10.8 3 10 3C9.2 3 8.4 9.5 8.4 9.5Z" 
      fill="currentColor" 
      opacity="0.3"
    />

    {/* 火焰 */}
    <path d="M9.2 15.5C9.2 15.5 10 16.5 10 16.5C10 16.5 10.8 15.5 10.8 15.5" 
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      opacity="0.6"
    >
      <animate
        attributeName="d"
        values="
          M9.2 15.5C9.2 15.5 10 16 10 16C10 16 10.8 15.5 10.8 15.5;
          M9.2 15.5C9.2 15.5 10 16.5 10 16.5C10 16.5 10.8 15.5 10.8 15.5;
          M9.2 15.5C9.2 15.5 10 16 10 16C10 16 10.8 15.5 10.8 15.5
        "
        dur="1s"
        repeatCount="indefinite"
      />
    </path>
  </g>
</svg>`;

export const linkActionIcon = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
  {/* 按钮背景 */}
  <circle cx="10" cy="10" r="9" fill="currentColor" opacity="0.1">
    <animate
      attributeName="opacity"
      values="0.1;0.15;0.1"
      dur="2s"
      repeatCount="indefinite"
    />
  </circle>

  <g transform="translate(10 10) rotate(45) translate(-10 -10)">
    {/* 左链环 */}
    <path d="M6 7.5C6 6.12 7.12 5 8.5 5H11V6.5H8.5C7.95 6.5 7.5 6.95 7.5 7.5V12.5C7.5 13.05 7.95 13.5 8.5 13.5H11V15H8.5C7.12 15 6 13.88 6 12.5V7.5Z"
      fill="currentColor"
    >
      <animate
        attributeName="opacity"
        values="0.85;1;0.85"
        dur="2s"
        repeatCount="indefinite"
      />
    </path>

    {/* 右链环 */}
    <path d="M14 12.5C14 13.88 12.88 15 11.5 15H9V13.5H11.5C12.05 13.5 12.5 13.05 12.5 12.5V7.5C12.5 6.95 12.05 6.5 11.5 6.5H9V5H11.5C12.88 5 14 6.12 14 7.5V12.5Z"
      fill="currentColor"
    >
      <animate
        attributeName="opacity"
        values="1;0.85;1"
        dur="2s"
        repeatCount="indefinite"
      />
    </path>

    {/* 中间连接线 */}
    <rect x="9" y="9.5" width="2" height="1" fill="currentColor" opacity="0.6">
      <animate
        attributeName="opacity"
        values="0.6;0.8;0.6"
        dur="1.5s"
        repeatCount="indefinite"
      />
    </rect>
  </g>
</svg>`;