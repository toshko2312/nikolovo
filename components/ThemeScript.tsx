/**
 * Applies the stored theme before first paint so a dark-mode reload never flashes light.
 * Must stay parser-blocking and render before any themed markup.
 */
const script = `(function(){try{if(localStorage.getItem('nikolovo-theme')==='dark')document.documentElement.classList.add('dark');}catch(e){}})();`;

export default function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
