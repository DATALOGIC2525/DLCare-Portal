'use client';

import { useEffect } from 'react';

export function KasanareScript() {
  useEffect(() => {
    if (!(window as any).Kasanare) {
      (function(){
        var a: any = window;
        if(a.Kasanare) return;
        var e: any = function(){e.c(arguments)};
        e.q=[];
        e.c=function(a: any){e.q.push(a)};
        a.Kasanare=e;
        
        var s = document.createElement('script');
        s.type = 'text/javascript';
        s.async = true;
        s.src = 'https://kasanare.com/kasanare_plugin.js';
        var firstScript = document.getElementsByTagName('script')[0];
        if (firstScript && firstScript.parentNode) {
          firstScript.parentNode.insertBefore(s, firstScript);
        } else {
          document.head.appendChild(s);
        }
      })();
      
      // Kasanareの初期化
      // もし 'selector' や 'container' オプションがあれば、枠内への埋め込みが可能になります
      (window as any).Kasanare('boot', {
        "tenantId": "datalogic2",
        "selector": "#kasanare-embed-target" // 枠内埋め込みを試行するための設定（仕様に基づく推測）
      });

      // スタイル調整：
      // フローティングボタンを隠し、ウィンドウが開いた際に枠内に収まるように調整を試みるCSS
      const style = document.createElement('style');
      style.id = 'kasanare-custom-style';
      style.innerHTML = `
        /* ランチャー（ボタン）を常に隠す */
        .kasanare-trigger, #kasanare-trigger, .kasanare-launcher { 
          display: none !important; 
        }

        /* 枠内（#kasanare-embed-target）に埋め込まれた際の表示調整 */
        #kasanare-embed-target iframe {
          position: relative !important;
          width: 100% !important;
          height: 100% !important;
          min-height: 600px;
          border-radius: 12px;
          display: block !important;
          opacity: 1 !important;
          visibility: visible !important;
          top: auto !important;
          left: auto !important;
          right: auto !important;
          bottom: auto !important;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  return null;
}
