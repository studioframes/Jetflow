import _userConfig from "./jetflow.config.js";

(function JetFlowEngine(global, document) {
  "use strict";
  if (!global || !document) return;

  // ─── CONSTANTS ─────────────────────────────────────────────────────────────
  var STYLE_ID  = "jf-runtime-style";
  var VERSION   = "1.0.0";
  var TRANSFORM = "translate3d(var(--jf-tx,0),var(--jf-ty,0),0) rotate(var(--jf-rotate,0)) skewX(var(--jf-skew-x,0)) skewY(var(--jf-skew-y,0)) scaleX(var(--jf-sx,1)) scaleY(var(--jf-sy,1))";
  var FILTER    = "blur(var(--jf-blur,0)) brightness(var(--jf-brightness,1)) contrast(var(--jf-contrast,1)) grayscale(var(--jf-grayscale,0)) hue-rotate(var(--jf-hue-rotate,0deg)) invert(var(--jf-invert,0)) saturate(var(--jf-saturate,1)) sepia(var(--jf-sepia,0))";
  var BF        = "blur(var(--jf-bd-blur,0)) brightness(var(--jf-bd-brightness,1)) contrast(var(--jf-bd-contrast,1)) grayscale(var(--jf-bd-grayscale,0)) hue-rotate(var(--jf-bd-hue-rotate,0deg)) invert(var(--jf-bd-invert,0)) saturate(var(--jf-bd-saturate,1)) sepia(var(--jf-bd-sepia,0))";
  var RING      = "var(--jf-ring-offset-shadow,0 0 #0000),var(--jf-ring-shadow,0 0 #0000),var(--jf-shadow,0 0 #0000)";

  // ─── SECURITY ──────────────────────────────────────────────────────────────
  var RE_BLOCKED   = /url\s*\(|javascript\s*:|expression\s*\(|@import|data\s*:/i;
  var RE_SAFE_CHARS = /^[#.,/()\s+\-*%0-9A-Za-z_]+$/;
  var RE_HEX       = /^#[0-9a-fA-F]{3,8}$/;
  var RE_UNIT      = /^-?\d*\.?\d+(px|rem|em|%|vh|vw|vmin|vmax|ch|ex|cm|mm|in|pt|pc|fr|deg|rad|turn|s|ms|svh|dvh|svw|dvw)$/i;
  var RE_NUMBER    = /^-?\d*\.?\d+$/;
  var RE_RGB       = /^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+(\s*,\s*[\d.]+)?\s*\)$/;
  var RE_HSL       = /^hsla?\(\s*[\d.]+\s*,\s*[\d.]+%\s*,\s*[\d.]+%(\s*,\s*[\d.]+)?\s*\)$/;
  var ALLOWED_FNS  = { calc:1, rgb:1, rgba:1, hsl:1, hsla:1, "var":1, env:1, min:1, max:1, clamp:1 };

  function sanitizeValue(v) {
    if (v === null || v === undefined) return null;
    var s = String(v).trim();
    if (!s) return null;
    if (RE_BLOCKED.test(s)) return null;
    if (/[<>"';{}\\]/.test(s)) return null;
    if (!isBalancedParens(s)) return null;
    var fnRe = /([A-Za-z-]+)\s*\(/g, m;
    while ((m = fnRe.exec(s))) {
      if (!ALLOWED_FNS[m[1].toLowerCase()]) return null;
    }
    if (!RE_SAFE_CHARS.test(s)) return null;
    return s;
  }

  function validateArbitrary(raw) {
    // Stricter validation for arbitrary bracket values
    if (!raw) return null;
    var s = String(raw).trim().replace(/_/g, " ");
    if (RE_BLOCKED.test(s)) return null;
    if (/[<>"';{}\\]/.test(s)) return null;
    if (RE_HEX.test(s))    return s;
    if (RE_UNIT.test(s))   return s;
    if (RE_NUMBER.test(s)) return s;
    if (RE_RGB.test(s))    return s;
    if (RE_HSL.test(s))    return s;
    if (/^(transparent|currentColor|inherit|initial|unset|auto|none)$/.test(s)) return s;
    if (/^calc\(/.test(s) && isBalancedParens(s))   return s;
    if (/^var\(--[A-Za-z0-9_-]+(\,.+)?\)$/.test(s)) return s;
    // Reject anything else
    return null;
  }

  function isBalancedParens(s) {
    var d = 0;
    for (var i = 0; i < s.length; i++) {
      var c = s.charAt(i);
      if (c === "(") d++;
      else if (c === ")") { d--; if (d < 0) return false; }
    }
    return d === 0;
  }

  function isSafeProp(p) {
    return /^--[A-Za-z0-9_-]+$/.test(p) || /^-?[A-Za-z][A-Za-z0-9-]*$/.test(p);
  }

  // ─── CSS RESET ─────────────────────────────────────────────────────────────
  var RESET_CSS = "*,::before,::after{box-sizing:border-box;border-width:0;border-style:solid;border-color:currentColor}" +
    "html{line-height:1.5;-webkit-text-size-adjust:100%;font-family:system-ui,sans-serif}" +
    "body{margin:0;line-height:inherit}" +
    "h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}" +
    "a{color:inherit;text-decoration:inherit}" +
    "b,strong{font-weight:bolder}" +
    "button,input,optgroup,select,textarea{font-family:inherit;font-size:100%;font-weight:inherit;line-height:inherit;color:inherit;margin:0;padding:0}" +
    "button,[type='button'],[type='reset'],[type='submit']{-webkit-appearance:button;background-color:transparent;background-image:none}" +
    "img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}" +
    "img,video{max-width:100%;height:auto}" +
    "table{border-collapse:collapse}" +
    "@keyframes jf-spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}" +
    "@keyframes jf-ping{75%,100%{transform:scale(2);opacity:0}}" +
    "@keyframes jf-pulse{0%,100%{opacity:1}50%{opacity:.5}}" +
    "@keyframes jf-bounce{0%,100%{transform:translateY(-25%);animation-timing-function:cubic-bezier(0.8,0,1,1)}50%{transform:none;animation-timing-function:cubic-bezier(0,0,0.2,1)}}";

  // ─── DEFAULT CONFIG ─────────────────────────────────────────────────────────
  var DEFAULT_CONFIG = {
    darkMode: "media",
    reset: true,
    debug: false,
    mutationDebounce: 16,
    important: false,
    screens: { sm:"640px", md:"768px", lg:"1024px", xl:"1280px", "2xl":"1536px" },
    safelist: [],
    utilities: {},
    apply: {},
    theme: {
      colors: {}, spacing: {}, fontSize: {}, fontWeight: {},
      lineHeight: {}, letterSpacing: {}, borderRadius: {}, borderWidth: {},
      opacity: {}, boxShadow: {}, blur: {}, zIndex: {},
      transitionDuration: {}, transitionTimingFunction: {}, animation: {}
    }
  };

  // ─── PSEUDO / VARIANT MAPS ─────────────────────────────────────────────────
  var PSEUDO = {
    hover: ":hover", focus: ":focus", active: ":active",
    visited: ":visited", disabled: ":disabled", enabled: ":enabled",
    checked: ":checked", invalid: ":invalid", valid: ":valid",
    required: ":required", optional: ":optional",
    "focus-within": ":focus-within", "focus-visible": ":focus-visible",
    first: ":first-child", last: ":last-child", only: ":only-child",
    odd: ":nth-child(odd)", even: ":nth-child(even)",
    empty: ":empty", target: ":target", open: "[open]",
    "placeholder-shown": ":placeholder-shown",
    "read-only": ":read-only", "read-write": ":read-write",
    "not-checked": ":not(:checked)"
  };

  // ─── STATIC UTILITIES (keyword-only, no value) ────────────────────────────
  function buildStaticMap() {
    var R = RING, T = TRANSFORM, F = FILTER, B = BF;
    return {
      // display
      block:{"display":"block"}, "inline-block":{"display":"inline-block"},
      inline:{"display":"inline"}, flex:{"display":"flex"},
      "inline-flex":{"display":"inline-flex"}, grid:{"display":"grid"},
      "inline-grid":{"display":"inline-grid"}, table:{"display":"table"},
      "table-row":{"display":"table-row"}, "table-cell":{"display":"table-cell"},
      contents:{"display":"contents"}, hidden:{"display":"none"},
      // position
      static:{"position":"static"}, fixed:{"position":"fixed"},
      absolute:{"position":"absolute"}, relative:{"position":"relative"},
      sticky:{"position":"sticky"},
      // flexbox
      "flex-row":{"flex-direction":"row"}, "flex-row-reverse":{"flex-direction":"row-reverse"},
      "flex-col":{"flex-direction":"column"}, "flex-col-reverse":{"flex-direction":"column-reverse"},
      "flex-wrap":{"flex-wrap":"wrap"}, "flex-nowrap":{"flex-wrap":"nowrap"},
      "flex-wrap-reverse":{"flex-wrap":"wrap-reverse"},
      "flex-1":{"flex":"1 1 0%"}, "flex-auto":{"flex":"1 1 auto"},
      "flex-initial":{"flex":"0 1 auto"}, "flex-none":{"flex":"none"},
      "flex-grow":{"flex-grow":"1"}, "flex-grow-0":{"flex-grow":"0"},
      "flex-shrink":{"flex-shrink":"1"}, "flex-shrink-0":{"flex-shrink":"0"},
      grow:{"flex-grow":"1"}, "grow-0":{"flex-grow":"0"},
      shrink:{"flex-shrink":"1"}, "shrink-0":{"flex-shrink":"0"},
      // items / justify / content / self
      "items-start":{"align-items":"flex-start"}, "items-end":{"align-items":"flex-end"},
      "items-center":{"align-items":"center"}, "items-baseline":{"align-items":"baseline"},
      "items-stretch":{"align-items":"stretch"},
      "justify-start":{"justify-content":"flex-start"}, "justify-end":{"justify-content":"flex-end"},
      "justify-center":{"justify-content":"center"}, "justify-between":{"justify-content":"space-between"},
      "justify-around":{"justify-content":"space-around"}, "justify-evenly":{"justify-content":"space-evenly"},
      "justify-stretch":{"justify-content":"stretch"},
      "justify-items-start":{"justify-items":"start"}, "justify-items-end":{"justify-items":"end"},
      "justify-items-center":{"justify-items":"center"}, "justify-items-stretch":{"justify-items":"stretch"},
      "justify-self-auto":{"justify-self":"auto"}, "justify-self-start":{"justify-self":"start"},
      "justify-self-end":{"justify-self":"end"}, "justify-self-center":{"justify-self":"center"},
      "justify-self-stretch":{"justify-self":"stretch"},
      "content-start":{"align-content":"flex-start"}, "content-end":{"align-content":"flex-end"},
      "content-center":{"align-content":"center"}, "content-between":{"align-content":"space-between"},
      "content-around":{"align-content":"space-around"}, "content-evenly":{"align-content":"space-evenly"},
      "content-baseline":{"align-content":"baseline"}, "content-stretch":{"align-content":"stretch"},
      "self-auto":{"align-self":"auto"}, "self-start":{"align-self":"flex-start"},
      "self-end":{"align-self":"flex-end"}, "self-center":{"align-self":"center"},
      "self-stretch":{"align-self":"stretch"}, "self-baseline":{"align-self":"baseline"},
      "place-items-start":{"place-items":"start"}, "place-items-end":{"place-items":"end"},
      "place-items-center":{"place-items":"center"}, "place-items-stretch":{"place-items":"stretch"},
      "place-content-start":{"place-content":"start"}, "place-content-end":{"place-content":"end"},
      "place-content-center":{"place-content":"center"}, "place-content-between":{"place-content":"space-between"},
      "place-content-around":{"place-content":"space-around"}, "place-content-evenly":{"place-content":"space-evenly"},
      "place-content-stretch":{"place-content":"stretch"},
      "place-self-auto":{"place-self":"auto"}, "place-self-start":{"place-self":"start"},
      "place-self-end":{"place-self":"end"}, "place-self-center":{"place-self":"center"},
      "place-self-stretch":{"place-self":"stretch"},
      // overflow
      "overflow-auto":{"overflow":"auto"}, "overflow-hidden":{"overflow":"hidden"},
      "overflow-visible":{"overflow":"visible"}, "overflow-scroll":{"overflow":"scroll"},
      "overflow-x-auto":{"overflow-x":"auto"}, "overflow-y-auto":{"overflow-y":"auto"},
      "overflow-x-hidden":{"overflow-x":"hidden"}, "overflow-y-hidden":{"overflow-y":"hidden"},
      "overflow-x-scroll":{"overflow-x":"scroll"}, "overflow-y-scroll":{"overflow-y":"scroll"},
      "overscroll-auto":{"overscroll-behavior":"auto"}, "overscroll-contain":{"overscroll-behavior":"contain"},
      "overscroll-none":{"overscroll-behavior":"none"},
      // visibility
      visible:{"visibility":"visible"}, invisible:{"visibility":"hidden"},
      collapse:{"visibility":"collapse"},
      // sizing keywords
      "w-auto":{"width":"auto"}, "h-auto":{"height":"auto"},
      "w-full":{"width":"100%"}, "h-full":{"height":"100%"},
      "w-screen":{"width":"100vw"}, "h-screen":{"height":"100vh"},
      "w-svw":{"width":"100svw"}, "h-svh":{"height":"100svh"},
      "w-dvw":{"width":"100dvw"}, "h-dvh":{"height":"100dvh"},
      "w-min":{"width":"min-content"}, "h-min":{"height":"min-content"},
      "w-max":{"width":"max-content"}, "h-max":{"height":"max-content"},
      "w-fit":{"width":"fit-content"}, "h-fit":{"height":"fit-content"},
      "min-w-0":{"min-width":"0px"}, "min-w-full":{"min-width":"100%"},
      "min-w-min":{"min-width":"min-content"}, "min-w-max":{"min-width":"max-content"},
      "min-w-fit":{"min-width":"fit-content"},
      "max-w-none":{"max-width":"none"}, "max-w-full":{"max-width":"100%"},
      "max-w-min":{"max-width":"min-content"}, "max-w-max":{"max-width":"max-content"},
      "max-w-fit":{"max-width":"fit-content"}, "max-w-screen-sm":{"max-width":"640px"},
      "max-w-screen-md":{"max-width":"768px"}, "max-w-screen-lg":{"max-width":"1024px"},
      "max-w-screen-xl":{"max-width":"1280px"}, "max-w-screen-2xl":{"max-width":"1536px"},
      "min-h-0":{"min-height":"0px"}, "min-h-full":{"min-height":"100%"},
      "min-h-screen":{"min-height":"100vh"}, "min-h-svh":{"min-height":"100svh"},
      "min-h-dvh":{"min-height":"100dvh"}, "min-h-min":{"min-height":"min-content"},
      "min-h-max":{"min-height":"max-content"}, "min-h-fit":{"min-height":"fit-content"},
      "max-h-none":{"max-height":"none"}, "max-h-full":{"max-height":"100%"},
      "max-h-screen":{"max-height":"100vh"}, "max-h-svh":{"max-height":"100svh"},
      "max-h-dvh":{"max-height":"100dvh"},
      // text
      "text-left":{"text-align":"left"}, "text-center":{"text-align":"center"},
      "text-right":{"text-align":"right"}, "text-justify":{"text-align":"justify"},
      "text-start":{"text-align":"start"}, "text-end":{"text-align":"end"},
      italic:{"font-style":"italic"}, "not-italic":{"font-style":"normal"},
      uppercase:{"text-transform":"uppercase"}, lowercase:{"text-transform":"lowercase"},
      capitalize:{"text-transform":"capitalize"}, "normal-case":{"text-transform":"none"},
      underline:{"text-decoration-line":"underline"}, overline:{"text-decoration-line":"overline"},
      "line-through":{"text-decoration-line":"line-through"}, "no-underline":{"text-decoration-line":"none"},
      antialiased:{"-webkit-font-smoothing":"antialiased","-moz-osx-font-smoothing":"grayscale"},
      "subpixel-antialiased":{"-webkit-font-smoothing":"auto","-moz-osx-font-smoothing":"auto"},
      truncate:{"overflow":"hidden","text-overflow":"ellipsis","white-space":"nowrap"},
      "text-ellipsis":{"text-overflow":"ellipsis"}, "text-clip":{"text-overflow":"clip"},
      "whitespace-normal":{"white-space":"normal"}, "whitespace-nowrap":{"white-space":"nowrap"},
      "whitespace-pre":{"white-space":"pre"}, "whitespace-pre-line":{"white-space":"pre-line"},
      "whitespace-pre-wrap":{"white-space":"pre-wrap"},
      "break-normal":{"overflow-wrap":"normal","word-break":"normal"},
      "break-words":{"overflow-wrap":"break-word"}, "break-all":{"word-break":"break-all"},
      "align-baseline":{"vertical-align":"baseline"}, "align-top":{"vertical-align":"top"},
      "align-middle":{"vertical-align":"middle"}, "align-bottom":{"vertical-align":"bottom"},
      "align-text-top":{"vertical-align":"text-top"}, "align-text-bottom":{"vertical-align":"text-bottom"},
      // background
      "bg-fixed":{"background-attachment":"fixed"}, "bg-local":{"background-attachment":"local"},
      "bg-scroll":{"background-attachment":"scroll"},
      "bg-clip-border":{"background-clip":"border-box"}, "bg-clip-padding":{"background-clip":"padding-box"},
      "bg-clip-content":{"background-clip":"content-box"},
      "bg-clip-text":{"background-clip":"text","-webkit-background-clip":"text","color":"transparent"},
      "bg-origin-border":{"background-origin":"border-box"}, "bg-origin-padding":{"background-origin":"padding-box"},
      "bg-origin-content":{"background-origin":"content-box"},
      "bg-bottom":{"background-position":"bottom"}, "bg-center":{"background-position":"center"},
      "bg-left":{"background-position":"left"}, "bg-left-bottom":{"background-position":"left bottom"},
      "bg-left-top":{"background-position":"left top"}, "bg-right":{"background-position":"right"},
      "bg-right-bottom":{"background-position":"right bottom"}, "bg-right-top":{"background-position":"right top"},
      "bg-top":{"background-position":"top"},
      "bg-repeat":{"background-repeat":"repeat"}, "bg-no-repeat":{"background-repeat":"no-repeat"},
      "bg-repeat-x":{"background-repeat":"repeat-x"}, "bg-repeat-y":{"background-repeat":"repeat-y"},
      "bg-auto":{"background-size":"auto"}, "bg-cover":{"background-size":"cover"},
      "bg-contain":{"background-size":"contain"},
      // border
      "border-solid":{"border-style":"solid"}, "border-dashed":{"border-style":"dashed"},
      "border-dotted":{"border-style":"dotted"}, "border-double":{"border-style":"double"},
      "border-hidden":{"border-style":"hidden"}, "border-none":{"border-style":"none"},
      "rounded-none":{"border-radius":"0px"},
      "outline-none":{"outline":"2px solid transparent","outline-offset":"2px"},
      outline:{"outline-style":"solid"}, "outline-dashed":{"outline-style":"dashed"},
      "outline-dotted":{"outline-style":"dotted"}, "outline-double":{"outline-style":"double"},
      "outline-offset-0":{"outline-offset":"0px"},
      // shadow / opacity
      "shadow-none":{"--jf-shadow":"0 0 #0000","box-shadow":R},
      "opacity-0":{"opacity":"0"}, "opacity-100":{"opacity":"1"},
      // filter
      filter:{"filter":F}, "filter-none":{"filter":"none"},
      "backdrop-filter":{"-webkit-backdrop-filter":B,"backdrop-filter":B},
      "backdrop-filter-none":{"-webkit-backdrop-filter":"none","backdrop-filter":"none"},
      grayscale:{"--jf-grayscale":"1","filter":F}, "grayscale-0":{"--jf-grayscale":"0","filter":F},
      invert:{"--jf-invert":"1","filter":F}, "invert-0":{"--jf-invert":"0","filter":F},
      sepia:{"--jf-sepia":"1","filter":F}, "sepia-0":{"--jf-sepia":"0","filter":F},
      "backdrop-grayscale":{"--jf-bd-grayscale":"1","-webkit-backdrop-filter":B,"backdrop-filter":B},
      "backdrop-invert":{"--jf-bd-invert":"1","-webkit-backdrop-filter":B,"backdrop-filter":B},
      "backdrop-sepia":{"--jf-bd-sepia":"1","-webkit-backdrop-filter":B,"backdrop-filter":B},
      // aspect ratio
      "aspect-auto":{"aspect-ratio":"auto"}, "aspect-square":{"aspect-ratio":"1/1"},
      "aspect-video":{"aspect-ratio":"16/9"},
      // ring
      "ring-inset":{"--jf-ring-inset":"inset","box-shadow":R},
      ring:_ringW("3px"), "ring-0":_ringW("0px"), "ring-1":_ringW("1px"),
      "ring-2":_ringW("2px"), "ring-4":_ringW("4px"), "ring-8":_ringW("8px"),
      "ring-offset-0":_ringOff("0px"), "ring-offset-1":_ringOff("1px"),
      "ring-offset-2":_ringOff("2px"), "ring-offset-4":_ringOff("4px"),
      // transition
      "transition-none":{"transition-property":"none"},
      transition:{"transition-property":"color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter","transition-timing-function":"cubic-bezier(0.4,0,0.2,1)","transition-duration":"150ms"},
      "transition-all":{"transition-property":"all","transition-timing-function":"cubic-bezier(0.4,0,0.2,1)","transition-duration":"150ms"},
      "transition-colors":{"transition-property":"color,background-color,border-color,text-decoration-color,fill,stroke","transition-timing-function":"cubic-bezier(0.4,0,0.2,1)","transition-duration":"150ms"},
      "transition-opacity":{"transition-property":"opacity","transition-timing-function":"cubic-bezier(0.4,0,0.2,1)","transition-duration":"150ms"},
      "transition-shadow":{"transition-property":"box-shadow","transition-timing-function":"cubic-bezier(0.4,0,0.2,1)","transition-duration":"150ms"},
      "transition-transform":{"transition-property":"transform","transition-timing-function":"cubic-bezier(0.4,0,0.2,1)","transition-duration":"150ms"},
      // transform
      transform:{"transform":T}, "transform-none":{"transform":"none"},
      "origin-center":{"transform-origin":"center"}, "origin-top":{"transform-origin":"top"},
      "origin-top-right":{"transform-origin":"top right"}, "origin-right":{"transform-origin":"right"},
      "origin-bottom-right":{"transform-origin":"bottom right"}, "origin-bottom":{"transform-origin":"bottom"},
      "origin-bottom-left":{"transform-origin":"bottom left"}, "origin-left":{"transform-origin":"left"},
      "origin-top-left":{"transform-origin":"top left"},
      "scale-0":_scale("0"), "scale-50":_scale(".5"), "scale-75":_scale(".75"),
      "scale-90":_scale(".9"), "scale-95":_scale(".95"), "scale-100":_scale("1"),
      "scale-105":_scale("1.05"), "scale-110":_scale("1.1"), "scale-125":_scale("1.25"), "scale-150":_scale("1.5"),
      "rotate-0":_rot("0deg"), "rotate-1":_rot("1deg"), "rotate-2":_rot("2deg"),
      "rotate-3":_rot("3deg"), "rotate-6":_rot("6deg"), "rotate-12":_rot("12deg"),
      "rotate-45":_rot("45deg"), "rotate-90":_rot("90deg"), "rotate-180":_rot("180deg"),
      // cursor
      "cursor-auto":{"cursor":"auto"}, "cursor-default":{"cursor":"default"},
      "cursor-pointer":{"cursor":"pointer"}, "cursor-wait":{"cursor":"wait"},
      "cursor-text":{"cursor":"text"}, "cursor-move":{"cursor":"move"},
      "cursor-help":{"cursor":"help"}, "cursor-not-allowed":{"cursor":"not-allowed"},
      "cursor-none":{"cursor":"none"}, "cursor-grab":{"cursor":"grab"},
      "cursor-grabbing":{"cursor":"grabbing"},
      // user-select
      "select-none":{"-webkit-user-select":"none","user-select":"none"},
      "select-text":{"-webkit-user-select":"text","user-select":"text"},
      "select-all":{"-webkit-user-select":"all","user-select":"all"},
      "select-auto":{"-webkit-user-select":"auto","user-select":"auto"},
      // pointer-events
      "pointer-events-none":{"pointer-events":"none"}, "pointer-events-auto":{"pointer-events":"auto"},
      // resize
      resize:{"resize":"both"}, "resize-none":{"resize":"none"},
      "resize-x":{"resize":"horizontal"}, "resize-y":{"resize":"vertical"},
      // list
      "list-none":{"list-style-type":"none"}, "list-disc":{"list-style-type":"disc"},
      "list-decimal":{"list-style-type":"decimal"},
      // misc
      "appearance-none":{"appearance":"none"}, "appearance-auto":{"appearance":"auto"},
      "animate-none":{"animation":"none"},
      "isolate":{"isolation":"isolate"}, "isolation-auto":{"isolation":"auto"},
      "object-contain":{"object-fit":"contain"}, "object-cover":{"object-fit":"cover"},
      "object-fill":{"object-fit":"fill"}, "object-none":{"object-fit":"none"},
      "object-scale-down":{"object-fit":"scale-down"},
      "sr-only":{"position":"absolute","width":"1px","height":"1px","padding":"0","margin":"-1px","overflow":"hidden","clip":"rect(0,0,0,0)","white-space":"nowrap","border-width":"0"},
      "not-sr-only":{"position":"static","width":"auto","height":"auto","padding":"0","margin":"0","overflow":"visible","clip":"auto","white-space":"normal"},
      "float-right":{"float":"right"}, "float-left":{"float":"left"}, "float-none":{"float":"none"},
      "clear-left":{"clear":"left"}, "clear-right":{"clear":"right"},
      "clear-both":{"clear":"both"}, "clear-none":{"clear":"none"},
      "box-border":{"box-sizing":"border-box"}, "box-content":{"box-sizing":"content-box"},
      "decoration-clone":{"-webkit-box-decoration-break":"clone","box-decoration-break":"clone"},
      "decoration-slice":{"-webkit-box-decoration-break":"slice","box-decoration-break":"slice"},
      "indent-0":{"text-indent":"0px"},
      "columns-auto":{"columns":"auto"}
    };
  }

  function _ringW(v) {
    return { "--jf-ring-shadow":"var(--jf-ring-inset,) 0 0 0 calc("+v+" + var(--jf-ring-offset-width,0px)) var(--jf-ring-color,rgb(59 130 246/0.5))","box-shadow":RING };
  }
  function _ringOff(v) {
    return { "--jf-ring-offset-width":v,"--jf-ring-offset-shadow":"var(--jf-ring-inset,) 0 0 0 var(--jf-ring-offset-width,0px) var(--jf-ring-offset-color,#fff)","box-shadow":RING };
  }
  function _scale(v) { return {"--jf-sx":v,"--jf-sy":v,"transform":TRANSFORM}; }
  function _rot(v)   { return {"--jf-rotate":v,"transform":TRANSFORM}; }

  // ─── UTILITY FUNCTIONS (JIT-style resolvers) ───────────────────────────────
  // Each function: (value, negative, theme) → declarations object | null

  function utilBg(value, _neg, theme) {
    var col = resolveColor(value, theme);
    if (col) return {"background-color":col};
    return null;
  }

  function utilP(value, neg, theme) {
    var v = resolveSpacing(value, theme);
    if (v === undefined) return null;
    if (neg && v !== "0px") v = "-" + v;
    return {padding: v};
  }

  function utilText(value, _neg, theme) {
    var fs = theme.fontSize && theme.fontSize[value];
    if (fs) {
      if (Array.isArray(fs)) return {"font-size":fs[0],"line-height":fs[1]};
      return {"font-size":fs};
    }
    // Arbitrary size via text-[22px]
    var col = resolveColor(value, theme);
    if (col) return {color: col};
    return null;
  }

  function utilFlex(_v, _n, _t) { return {display:"flex"}; }
  function utilGrid(_v, _n, _t) { return {display:"grid"}; }

  // ─── DYNAMIC UTILITY RESOLVER ─────────────────────────────────────────────
  var SPACING_PREFIXES = [
    ["px",     ["padding-left","padding-right"]],
    ["py",     ["padding-top","padding-bottom"]],
    ["pt",     ["padding-top"]],    ["pr",     ["padding-right"]],
    ["pb",     ["padding-bottom"]], ["pl",     ["padding-left"]],
    ["p",      ["padding"]],
    ["mx",     ["margin-left","margin-right"]],
    ["my",     ["margin-top","margin-bottom"]],
    ["mt",     ["margin-top"]],     ["mr",     ["margin-right"]],
    ["mb",     ["margin-bottom"]],  ["ml",     ["margin-left"]],
    ["m",      ["margin"]],
    ["gap-x",  ["column-gap"]], ["gap-y",  ["row-gap"]], ["gap", ["gap"]],
    ["inset-x",["left","right"]], ["inset-y",["top","bottom"]],
    ["inset",  ["top","right","bottom","left"]],
    ["top",    ["top"]], ["right",["right"]], ["bottom",["bottom"]], ["left",["left"]]
  ];

  var SIZE_PREFIXES = [
    ["min-w",  ["min-width"]], ["max-w",  ["max-width"]], ["w", ["width"]],
    ["min-h",  ["min-height"]], ["max-h", ["max-height"]], ["h", ["height"]],
    ["basis",  ["flex-basis"]]
  ];

  function resolveDynamic(base, neg, theme) {
    var key, val, color;

    // ── spacing ──
    for (var si = 0; si < SPACING_PREFIXES.length; si++) {
      var sp = SPACING_PREFIXES[si][0], props = SPACING_PREFIXES[si][1];
      if (base === sp + "-auto") return makeDecls(props, "auto");
      if (startsWith(base, sp + "-")) {
        key = base.slice(sp.length + 1);
        // Arbitrary: p-[13px]
        if (startsWith(key, "[") && endsWith(key, "]")) {
          val = validateArbitrary(key.slice(1, -1));
          if (!val) return null;
          if (neg && val !== "0px") val = "-" + val;
          return makeDecls(props, val);
        }
        val = resolveSpacing(key, theme);
        if (val !== undefined) {
          if (neg && val !== "0px") val = "-" + val;
          return makeDecls(props, val);
        }
      }
    }

    // ── space-x / space-y ──
    if (startsWith(base, "space-x-")) {
      val = resolveSpacingOrArbitrary(base.slice(8), neg, theme);
      if (val) return {rules:[{selector:"& > :not([hidden]) ~ :not([hidden])",declarations:{"margin-left":val}}]};
    }
    if (startsWith(base, "space-y-")) {
      val = resolveSpacingOrArbitrary(base.slice(8), neg, theme);
      if (val) return {rules:[{selector:"& > :not([hidden]) ~ :not([hidden])",declarations:{"margin-top":val}}]};
    }

    // ── sizing ──
    for (var zi = 0; zi < SIZE_PREFIXES.length; zi++) {
      var zp = SIZE_PREFIXES[zi][0], zprops = SIZE_PREFIXES[zi][1];
      if (startsWith(base, zp + "-")) {
        key = base.slice(zp.length + 1);
        if (startsWith(key, "[") && endsWith(key, "]")) {
          val = validateArbitrary(key.slice(1, -1));
          if (!val) return null;
          return makeDecls(zprops, val);
        }
        val = resolveSize(key, zp, theme);
        if (val !== undefined) return makeDecls(zprops, val);
      }
    }

    // ── text color / size ──
    if (startsWith(base, "text-")) {
      key = base.slice(5);
      if (startsWith(key, "[") && endsWith(key, "]")) {
        val = validateArbitrary(key.slice(1, -1));
        if (!val) return null;
        return looksLikeLength(val) ? {"declarations":{"font-size":val}} : {"declarations":{"color":val}};
      }
      var fs = theme.fontSize && theme.fontSize[key];
      if (fs) {
        if (Array.isArray(fs)) return {declarations:{"font-size":fs[0],"line-height":fs[1]}};
        return {declarations:{"font-size":fs}};
      }
      color = resolveColor(key, theme);
      if (color) return {declarations:{color:color}};
    }

    // ── bg color / arbitrary ──
    if (startsWith(base, "bg-")) {
      key = base.slice(3);
      if (startsWith(key, "[") && endsWith(key, "]")) {
        val = validateArbitrary(key.slice(1, -1));
        if (!val) return null;
        return {declarations:{"background-color":val}};
      }
      color = resolveColor(key, theme);
      if (color) return {declarations:{"background-color":color}};
    }

    // ── font ──
    if (startsWith(base, "font-")) {
      key = base.slice(5);
      if (startsWith(key, "[") && endsWith(key, "]")) {
        val = validateArbitrary(key.slice(1, -1));
        if (!val) return null;
        return {declarations:{"font-weight":val}};
      }
      val = theme.fontWeight && theme.fontWeight[key];
      if (val) return {declarations:{"font-weight":val}};
      if (key === "sans") return {declarations:{"font-family":"system-ui,-apple-system,BlinkMacSystemFont,\"Segoe UI\",sans-serif"}};
      if (key === "serif") return {declarations:{"font-family":"ui-serif,Georgia,Cambria,\"Times New Roman\",Times,serif"}};
      if (key === "mono") return {declarations:{"font-family":"ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,\"Liberation Mono\",\"Courier New\",monospace"}};
    }

    // ── leading ──
    if (startsWith(base, "leading-")) {
      key = base.slice(8);
      if (startsWith(key, "[") && endsWith(key, "]")) {
        val = validateArbitrary(key.slice(1, -1));
        if (!val) return null;
        return {declarations:{"line-height":val}};
      }
      val = theme.lineHeight && theme.lineHeight[key];
      if (val) return {declarations:{"line-height":val}};
    }

    // ── tracking ──
    if (startsWith(base, "tracking-")) {
      key = base.slice(9);
      if (startsWith(key, "[") && endsWith(key, "]")) {
        val = validateArbitrary(key.slice(1, -1));
        if (!val) return null;
        return {declarations:{"letter-spacing":val}};
      }
      val = theme.letterSpacing && theme.letterSpacing[key];
      if (val !== undefined) return {declarations:{"letter-spacing":val}};
    }

    // ── border ──
    if (base === "border") return {declarations:{"border-width":theme.borderWidth && theme.borderWidth.DEFAULT || "1px"}};
    if (startsWith(base, "border-")) {
      key = base.slice(7);
      if (startsWith(key, "[") && endsWith(key, "]")) {
        val = validateArbitrary(key.slice(1, -1));
        if (!val) return null;
        return looksLikeLength(val) ? {declarations:{"border-width":val}} : {declarations:{"border-color":val}};
      }
      val = theme.borderWidth && theme.borderWidth[key];
      if (val !== undefined) return {declarations:{"border-width":val}};
      color = resolveColor(key, theme);
      if (color) return {declarations:{"border-color":color}};
      var bSideR = resolveBorderSide(base, theme);
      if (bSideR) return bSideR;
    }

    // ── rounded ──
    if (base === "rounded") return {declarations:{"border-radius": theme.borderRadius && theme.borderRadius.DEFAULT || "0.25rem"}};
    if (startsWith(base, "rounded-")) {
      key = base.slice(8);
      if (startsWith(key, "[") && endsWith(key, "]")) {
        val = validateArbitrary(key.slice(1, -1));
        if (!val) return null;
        return {declarations:{"border-radius":val}};
      }
      val = theme.borderRadius && theme.borderRadius[key];
      if (val !== undefined) return {declarations:{"border-radius":val}};
      var rrSide = resolveRoundedSide(base, theme);
      if (rrSide) return rrSide;
    }

    // ── shadow ──
    if (base === "shadow") return {declarations:{"--jf-shadow":(theme.boxShadow && theme.boxShadow.DEFAULT) || "0 1px 3px 0 rgb(0 0 0/0.1)","box-shadow":RING}};
    if (startsWith(base, "shadow-")) {
      key = base.slice(7);
      if (startsWith(key, "[") && endsWith(key, "]")) {
        val = validateArbitrary(key.slice(1, -1));
        if (!val) return null;
        return {declarations:{"--jf-shadow":val,"box-shadow":RING}};
      }
      val = theme.boxShadow && theme.boxShadow[key];
      if (val) return {declarations:{"--jf-shadow":val,"box-shadow":RING}};
    }

    // ── opacity ──
    if (startsWith(base, "opacity-")) {
      key = base.slice(8);
      if (startsWith(key, "[") && endsWith(key, "]")) {
        val = validateArbitrary(key.slice(1, -1));
        if (!val) return null;
        return {declarations:{opacity:val}};
      }
      val = theme.opacity && theme.opacity[key];
      if (val !== undefined) return {declarations:{opacity:val}};
    }

    // ── z-index ──
    if (startsWith(base, "z-")) {
      key = base.slice(2);
      if (startsWith(key, "[") && endsWith(key, "]")) {
        val = validateArbitrary(key.slice(1, -1));
        if (!val) return null;
        return {declarations:{"z-index":neg ? "-"+val : val}};
      }
      val = theme.zIndex && theme.zIndex[key];
      if (val !== undefined) return {declarations:{"z-index":neg ? "-"+val : val}};
      if (/^\d+$/.test(key)) return {declarations:{"z-index":neg ? "-"+key : key}};
    }

    // ── blur ──
    if (base === "blur") return {declarations:{"--jf-blur":(theme.blur&&theme.blur.DEFAULT)||"8px","filter":FILTER}};
    if (startsWith(base, "blur-")) {
      key = base.slice(5);
      if (startsWith(key, "[") && endsWith(key, "]")) {
        val = validateArbitrary(key.slice(1, -1));
        if (!val) return null;
        return {declarations:{"--jf-blur":val,"filter":FILTER}};
      }
      val = theme.blur && theme.blur[key];
      if (val !== undefined) return {declarations:{"--jf-blur":val,"filter":FILTER}};
    }

    // ── brightness / contrast / saturate / hue-rotate ──
    var filterMap = [
      ["brightness-","--jf-brightness",null],
      ["contrast-","--jf-contrast",null],
      ["saturate-","--jf-saturate",null],
      ["hue-rotate-","--jf-hue-rotate",null]
    ];
    for (var fi = 0; fi < filterMap.length; fi++) {
      var fpx = filterMap[fi][0], fprop = filterMap[fi][1];
      if (startsWith(base, fpx)) {
        key = base.slice(fpx.length);
        if (startsWith(key, "[") && endsWith(key, "]")) {
          val = validateArbitrary(key.slice(1, -1));
          if (!val) return null;
          if (neg) val = "-" + val;
          return {declarations:{[fprop]:val,"filter":FILTER}};
        }
        var fscale = fpx === "brightness-" ? theme.brightness :
                     fpx === "contrast-"   ? theme.contrast   :
                     fpx === "saturate-"   ? theme.saturate   : theme.hueRotate;
        val = fscale && fscale[key];
        if (val !== undefined) {
          if (neg) val = "-" + val;
          return {declarations:{[fprop]:val,"filter":FILTER}};
        }
      }
    }

    // ── ring / ring-color ──
    if (startsWith(base, "ring-offset-")) {
      key = base.slice(12);
      color = resolveColor(key, theme);
      if (color) return {declarations:{"--jf-ring-offset-color":color,"--jf-ring-offset-shadow":"var(--jf-ring-inset,) 0 0 0 var(--jf-ring-offset-width,0px) "+color,"box-shadow":RING}};
    }
    if (startsWith(base, "ring-")) {
      key = base.slice(5);
      color = resolveColor(key, theme);
      if (color) return {declarations:{"--jf-ring-color":color,"box-shadow":RING}};
    }

    // ── transition duration / timing ──
    if (startsWith(base, "duration-")) {
      key = base.slice(9);
      val = theme.transitionDuration && theme.transitionDuration[key];
      if (!val && /^\d+$/.test(key)) val = key + "ms";
      if (val) return {declarations:{"transition-duration":val}};
    }
    if (startsWith(base, "ease-")) {
      key = base.slice(5);
      var easeMap = {linear:"linear","in":"cubic-bezier(0.4,0,1,1)","out":"cubic-bezier(0,0,0.2,1)","in-out":"cubic-bezier(0.4,0,0.2,1)"};
      val = easeMap[key];
      if (val) return {declarations:{"transition-timing-function":val}};
    }

    // ── delay ──
    if (startsWith(base, "delay-")) {
      key = base.slice(6);
      if (/^\d+$/.test(key)) return {declarations:{"transition-delay":key+"ms"}};
    }

    // ── scale / rotate / translate / skew (with arbitrary) ──
    if (startsWith(base, "scale-")) {
      key = base.slice(6);
      if (startsWith(key, "[") && endsWith(key, "]")) {
        val = validateArbitrary(key.slice(1, -1));
        if (!val) return null;
        return {declarations:{"--jf-sx":val,"--jf-sy":val,"transform":TRANSFORM}};
      }
      if (/^\d+$/.test(key)) { val = String(parseInt(key,10)/100); return {declarations:{"--jf-sx":val,"--jf-sy":val,"transform":TRANSFORM}}; }
    }
    if (startsWith(base, "rotate-")) {
      key = base.slice(7);
      if (startsWith(key, "[") && endsWith(key, "]")) {
        val = validateArbitrary(key.slice(1, -1));
        if (!val) return null;
        if (neg) val = "-" + val;
        return {declarations:{"--jf-rotate":val,"transform":TRANSFORM}};
      }
      if (/^\d+$/.test(key)) { val = (neg?"-":"")+key+"deg"; return {declarations:{"--jf-rotate":val,"transform":TRANSFORM}}; }
    }
    if (startsWith(base, "translate-x-")) {
      key = base.slice(12);
      val = resolveSpacingOrArbitrary(key, neg, theme);
      if (val) return {declarations:{"--jf-tx":val,"transform":TRANSFORM}};
    }
    if (startsWith(base, "translate-y-")) {
      key = base.slice(12);
      val = resolveSpacingOrArbitrary(key, neg, theme);
      if (val) return {declarations:{"--jf-ty":val,"transform":TRANSFORM}};
    }
    if (startsWith(base, "skew-x-")) {
      key = base.slice(7);
      val = resolveSpacingOrArbitrary(key, neg, theme);
      if (val) return {declarations:{"--jf-skew-x":val,"transform":TRANSFORM}};
    }
    if (startsWith(base, "skew-y-")) {
      key = base.slice(7);
      val = resolveSpacingOrArbitrary(key, neg, theme);
      if (val) return {declarations:{"--jf-skew-y":val,"transform":TRANSFORM}};
    }

    // ── grid ──
    if (/^grid-cols-(\d+)$/.test(base)) {
      val = base.match(/^grid-cols-(\d+)$/)[1];
      return {declarations:{"grid-template-columns":"repeat("+val+",minmax(0,1fr))"}};
    }
    if (/^grid-rows-(\d+)$/.test(base)) {
      val = base.match(/^grid-rows-(\d+)$/)[1];
      return {declarations:{"grid-template-rows":"repeat("+val+",minmax(0,1fr))"}};
    }
    if (/^col-span-(\d+)$/.test(base)) {
      val = base.match(/^col-span-(\d+)$/)[1];
      return {declarations:{"grid-column":"span "+val+" / span "+val}};
    }
    if (/^row-span-(\d+)$/.test(base)) {
      val = base.match(/^row-span-(\d+)$/)[1];
      return {declarations:{"grid-row":"span "+val+" / span "+val}};
    }
    if (/^col-start-(\d+)$/.test(base)) return {declarations:{"grid-column-start":base.slice(10)}};
    if (/^col-end-(\d+)$/.test(base))   return {declarations:{"grid-column-end":base.slice(8)}};
    if (/^row-start-(\d+)$/.test(base)) return {declarations:{"grid-row-start":base.slice(10)}};
    if (/^row-end-(\d+)$/.test(base))   return {declarations:{"grid-row-end":base.slice(8)}};
    if (/^grid-cols-\[.+\]$/.test(base)) {
      val = validateArbitrary(base.slice(12, -1));
      if (val) return {declarations:{"grid-template-columns":val}};
    }
    if (/^grid-rows-\[.+\]$/.test(base)) {
      val = validateArbitrary(base.slice(12, -1));
      if (val) return {declarations:{"grid-template-rows":val}};
    }

    // ── order ──
    if (startsWith(base, "order-")) {
      key = base.slice(6);
      var orderFixed = {first:"-9999", last:"9999", none:"0"};
      val = orderFixed[key] || (/^\d+$/.test(key) ? key : undefined);
      if (val !== undefined) return {declarations:{order:neg?"-"+val:val}};
    }

    // ── outline ──
    if (startsWith(base, "outline-")) {
      key = base.slice(8);
      if (startsWith(key, "[") && endsWith(key, "]")) {
        val = validateArbitrary(key.slice(1, -1));
        if (!val) return null;
        return looksLikeLength(val) ? {declarations:{"outline-width":val}} : {declarations:{"outline-color":val}};
      }
      color = resolveColor(key, theme);
      if (color) return {declarations:{"outline-color":color}};
      if (/^\d+$/.test(key)) return {declarations:{"outline-width":key+"px"}};
    }

    // ── fill / stroke ──
    if (startsWith(base, "fill-")) {
      color = resolveColor(base.slice(5), theme);
      if (color) return {declarations:{fill:color}};
    }
    if (startsWith(base, "stroke-")) {
      key = base.slice(7);
      color = resolveColor(key, theme);
      if (color) return {declarations:{stroke:color}};
      if (/^\d+$/.test(key)) return {declarations:{"stroke-width":key+"px"}};
    }

    // ── caret / accent ──
    if (startsWith(base, "caret-")) { color = resolveColor(base.slice(6), theme); if (color) return {declarations:{"caret-color":color}}; }
    if (startsWith(base, "accent-")) { color = resolveColor(base.slice(7), theme); if (color) return {declarations:{"accent-color":color}}; }

    // ── decoration (text-decoration-color / thickness) ──
    if (startsWith(base, "decoration-")) {
      key = base.slice(11);
      color = resolveColor(key, theme);
      if (color) return {declarations:{"text-decoration-color":color}};
      if (looksLikeLength(key)) return {declarations:{"text-decoration-thickness":key}};
    }

    // ── animate ──
    if (startsWith(base, "animate-")) {
      key = base.slice(8);
      val = theme.animation && theme.animation[key];
      if (val) return {declarations:{animation:val}};
    }

    // ── columns ──
    if (startsWith(base, "columns-")) {
      key = base.slice(8);
      if (/^\d+$/.test(key)) return {declarations:{columns:key}};
      val = resolveSize(key, "w", theme);
      if (val) return {declarations:{columns:val}};
    }

    // ── aspect ──
    if (startsWith(base, "aspect-")) {
      key = base.slice(7);
      if (startsWith(key, "[") && endsWith(key, "]")) {
        val = validateArbitrary(key.slice(1, -1));
        if (!val) return null;
        return {declarations:{"aspect-ratio":val}};
      }
    }

    // ── indent ──
    if (startsWith(base, "indent-")) {
      key = base.slice(7);
      val = resolveSpacingOrArbitrary(key, neg, theme);
      if (val) return {declarations:{"text-indent":val}};
    }

    // ── object-position ──
    if (startsWith(base, "object-")) {
      key = base.slice(7);
      if (startsWith(key, "[") && endsWith(key, "]")) {
        val = validateArbitrary(key.slice(1, -1));
        if (!val) return null;
        return {declarations:{"object-position":val}};
      }
    }

    // ── fully arbitrary property: [property:value] ──
    if (startsWith(base, "[") && endsWith(base, "]")) {
      return resolveArbitraryProperty(base.slice(1, -1));
    }

    // ── scoped: jf-scope-[name] ──
    if (/^jf-scope-\[/.test(base)) return null; // handled at selector level

    return null;
  }

  function resolveBorderSide(base, theme) {
    var sides = {
      "border-x": ["border-left-width","border-right-width"],
      "border-y": ["border-top-width","border-bottom-width"],
      "border-t": ["border-top-width"], "border-r": ["border-right-width"],
      "border-b": ["border-bottom-width"], "border-l": ["border-left-width"]
    };
    for (var s in sides) {
      if (!Object.prototype.hasOwnProperty.call(sides, s)) continue;
      if (base === s) return {declarations: makeDecls(sides[s], (theme.borderWidth && theme.borderWidth.DEFAULT) || "1px")};
      if (startsWith(base, s + "-")) {
        var key = base.slice(s.length + 1);
        var val = theme.borderWidth && theme.borderWidth[key];
        if (val !== undefined) return {declarations: makeDecls(sides[s], val)};
      }
    }
    return null;
  }

  function resolveRoundedSide(base, theme) {
    var corners = {
      "rounded-t":  ["border-top-left-radius","border-top-right-radius"],
      "rounded-r":  ["border-top-right-radius","border-bottom-right-radius"],
      "rounded-b":  ["border-bottom-right-radius","border-bottom-left-radius"],
      "rounded-l":  ["border-top-left-radius","border-bottom-left-radius"],
      "rounded-tl": ["border-top-left-radius"],    "rounded-tr": ["border-top-right-radius"],
      "rounded-br": ["border-bottom-right-radius"], "rounded-bl": ["border-bottom-left-radius"]
    };
    for (var c in corners) {
      if (!Object.prototype.hasOwnProperty.call(corners, c)) continue;
      if (base === c) return {declarations: makeDecls(corners[c], (theme.borderRadius && theme.borderRadius.DEFAULT) || "0.25rem")};
      if (startsWith(base, c + "-")) {
        var key = base.slice(c.length + 1);
        var val = theme.borderRadius && theme.borderRadius[key];
        if (val !== undefined) return {declarations: makeDecls(corners[c], val)};
      }
    }
    return null;
  }

  function resolveArbitraryProperty(inner) {
    var colon = inner.indexOf(":");
    if (colon <= 0) return null;
    var prop = inner.slice(0, colon).trim();
    var rawVal = inner.slice(colon + 1).trim().replace(/_/g, " ");
    if (!isSafeProp(prop)) return null;
    var val = sanitizeValue(rawVal);
    if (!val) return null;
    var d = {};
    d[prop] = val;
    return {declarations: d};
  }

  // ─── VALUE HELPERS ─────────────────────────────────────────────────────────

  function resolveSpacing(key, theme) {
    if (key === "auto") return "auto";
    if (key === "px")   return "1px";
    if (key === "0")    return "0px";
    var sc = theme.spacing;
    if (sc && Object.prototype.hasOwnProperty.call(sc, key)) return sc[key];
    if (/^\d+(\.\d+)?(px|rem|em|%|vh|vw)$/.test(key)) return key;
    return undefined;
  }

  function resolveSpacingOrArbitrary(key, neg, theme) {
    if (startsWith(key, "[") && endsWith(key, "]")) {
      var v = validateArbitrary(key.slice(1, -1));
      if (!v) return null;
      if (neg && v !== "0px") v = "-" + v;
      return v;
    }
    var sp = resolveSpacing(key, theme);
    if (sp !== undefined) {
      if (neg && sp !== "0px") sp = "-" + sp;
      return sp;
    }
    var frac = fractionToPercent(key);
    if (frac) return neg ? "-" + frac : frac;
    return null;
  }

  function resolveSize(key, prefix, theme) {
    var fixed = {auto:"auto",full:"100%",screen:(prefix&&prefix.indexOf("h")!==-1)?"100vh":"100vw",
      svw:"100svw",lvw:"100lvw",dvw:"100dvw",svh:"100svh",lvh:"100lvh",dvh:"100dvh",
      min:"min-content",max:"max-content",fit:"fit-content"};
    if (fixed[key]) return fixed[key];
    if (key === "none" && prefix && startsWith(prefix,"max")) return "none";
    var sp = resolveSpacing(key, theme);
    if (sp !== undefined) return sp;
    var frac = fractionToPercent(key);
    if (frac) return frac;
    return undefined;
  }

  function resolveColor(key, theme) {
    if (!key) return null;
    var parts = splitOutside(key, "/");
    var colorKey = parts[0];
    var alpha = parts.length > 1 ? parts.slice(1).join("/") : null;
    var col = findColor(colorKey, theme);
    if (!col && looksLikeRawColor(colorKey)) col = colorKey;
    if (!col) return null;
    if (alpha !== null) {
      var av = startsWith(alpha,"[") && endsWith(alpha,"]") ? alpha.slice(1,-1) : alpha;
      col = applyAlpha(col, av);
    }
    return col;
  }

  function findColor(key, theme) {
    var colors = (theme && theme.colors) || {};
    if (Object.prototype.hasOwnProperty.call(colors, key) && typeof colors[key] === "string") return colors[key];
    var parts = key.split("-");
    var cur = colors;
    for (var i = 0; i < parts.length; i++) {
      if (cur && Object.prototype.hasOwnProperty.call(cur, parts[i])) { cur = cur[parts[i]]; }
      else return null;
    }
    if (typeof cur === "string") return cur;
    if (cur && typeof cur.DEFAULT === "string") return cur.DEFAULT;
    return null;
  }

  function applyAlpha(col, alpha) {
    var n = parseFloat(alpha);
    if (!isNaN(n) && n > 1) n = n / 100;
    var rgb = hexToRgb(col);
    if (rgb) return "rgba("+rgb.r+","+rgb.g+","+rgb.b+","+(isNaN(n)?alpha:n)+")";
    return "color-mix(in srgb,"+col+" "+(isNaN(n)?alpha:n*100)+"%, transparent)";
  }

  function hexToRgb(col) {
    var s3 = /^#([0-9a-f]{3})$/i.exec(col);
    if (s3) { var x=s3[1]; return {r:parseInt(x[0]+x[0],16),g:parseInt(x[1]+x[1],16),b:parseInt(x[2]+x[2],16)}; }
    var s6 = /^#([0-9a-f]{6})$/i.exec(col);
    if (s6) { var h=s6[1]; return {r:parseInt(h.slice(0,2),16),g:parseInt(h.slice(2,4),16),b:parseInt(h.slice(4,6),16)}; }
    return null;
  }

  function looksLikeRawColor(v) {
    return /^(#|rgb\(|rgba\(|hsl\(|hsla\()/i.test(v) ||
      /^(transparent|currentColor|inherit|black|white)$/.test(v);
  }

  function looksLikeLength(v) {
    return /^-?\d+(\.\d+)?(px|rem|em|%|vh|vw|vmin|vmax|ch|ex|cm|mm|in|pt|pc|fr|deg|rad|turn|s|ms)$/i.test(v) ||
      /^(calc|clamp|min|max|var)\(/.test(v);
  }

  function fractionToPercent(key) {
    var m = /^(\d+)\/(\d+)$/.exec(key);
    if (!m) return null;
    var d = parseFloat(m[2]);
    if (!d) return null;
    return (parseFloat(m[1]) / d * 100) + "%";
  }

  function makeDecls(props, val) {
    var d = {};
    for (var i = 0; i < props.length; i++) d[props[i]] = val;
    return {declarations: d};
  }

  // ─── CLASS PARSER ──────────────────────────────────────────────────────────
  // Returns { variants: string[], utility: string, value: string, important: bool, raw: string }

  function parseToken(raw) {
    var parts = splitOutside(raw, ":");
    var base  = parts.pop() || "";
    var important = false;
    if (base.charAt(0) === "!") { important = true; base = base.slice(1); }
    if (base.charAt(base.length - 1) === "!") { important = true; base = base.slice(0, -1); }

    var uv = splitUtilityValue(base);
    return {
      variants:  parts,          // ["md","hover","focus"] — media first, pseudo last
      utility:   uv.utility,     // "bg", "p", "text", etc.
      value:     uv.value,       // "blue-500", "4", "xl", etc.
      base:      base,           // original base string (for resolver)
      important: important,
      raw:       raw
    };
  }

  // Known utility prefixes, longest first to avoid partial matches
  var UTILITY_PREFIXES = [
    "backdrop-filter","backdrop-grayscale","backdrop-invert","backdrop-sepia",
    "translate-x","translate-y","underline-offset","skew-x","skew-y",
    "object-position","bg-clip","bg-origin","bg-position","bg-size",
    "border-spacing","grid-cols","grid-rows","col-span","col-start","col-end",
    "row-span","row-start","row-end","ring-offset","decoration",
    "stroke-width","outline-offset","rounded-tl","rounded-tr","rounded-bl","rounded-br",
    "rounded-t","rounded-r","rounded-b","rounded-l","rounded",
    "border-x","border-y","border-t","border-r","border-b","border-l","border",
    "inset-x","inset-y","inset","min-w","max-w","min-h","max-h",
    "gap-x","gap-y","gap","space-x","space-y","hue-rotate",
    "brightness","contrast","saturate","font-size",
    "animate","aspect","accent","basis","blur","caret","columns","content",
    "cursor","delay","duration","ease","fill","font","grid","indent",
    "leading","list","object","opacity","order","origin","outline",
    "overflow","overscroll","ring","rotate","scale","sepia","shadow",
    "stroke","text","tracking","transition","z",
    "flex","bg","m","p","h","w"
  ];

  function splitUtilityValue(base) {
    for (var i = 0; i < UTILITY_PREFIXES.length; i++) {
      var pfx = UTILITY_PREFIXES[i];
      if (base === pfx) return {utility: pfx, value: ""};
      if (startsWith(base, pfx + "-")) return {utility: pfx, value: base.slice(pfx.length + 1)};
    }
    return {utility: base, value: ""};
  }

  function splitOutside(str, sep) {
    var parts = [], cur = "", depth = 0, esc = false;
    for (var i = 0; i < str.length; i++) {
      var c = str.charAt(i);
      if (esc) { cur += c; esc = false; continue; }
      if (c === "\\") { cur += c; esc = true; continue; }
      if (c === "[") depth++;
      if (c === "]") depth = Math.max(0, depth - 1);
      if (c === sep && depth === 0) { parts.push(cur); cur = ""; }
      else cur += c;
    }
    parts.push(cur);
    return parts;
  }

  function splitClasses(val) {
    var chunks = [], cur = "", bd = 0, pd = 0, esc = false;
    for (var i = 0; i < val.length; i++) {
      var c = val.charAt(i);
      if (esc) { cur += c; esc = false; continue; }
      if (c === "\\") { cur += c; esc = true; continue; }
      if (c === "[") bd++;
      if (c === "]") bd = Math.max(0, bd - 1);
      if (c === "(" && bd === 0) pd++;
      if (c === ")" && bd === 0) pd = Math.max(0, pd - 1);
      if (/\s/.test(c) && bd === 0 && pd === 0) { if (cur) { chunks.push(cur); cur = ""; } }
      else cur += c;
    }
    if (cur) chunks.push(cur);
    return chunks;
  }

  function startsWith(str, prefix) { return String(str).indexOf(prefix) === 0; }
  function endsWith(str, suffix)   { return String(str).slice(-suffix.length) === suffix; }

  // ─── SELECTOR CONTEXT BUILDER ──────────────────────────────────────────────
  // Correct order: media queries → container → dark → selector pseudo

  function buildContext(token, parsed, scopePrefix) {
    var sel = "." + cssEscape(token);
    if (scopePrefix) sel = scopePrefix + " " + sel;
    var media = [], dark = false;

    // Sort variants: media first, then dark, then pseudo
    var variants = parsed.variants || [];
    for (var i = 0; i < variants.length; i++) {
      var v = variants[i];
      if (!v) continue;

      // Responsive (media)
      if (config.screens[v]) { media.push("(min-width:" + config.screens[v] + ")"); continue; }

      // Dark mode
      if (v === "dark") { dark = true; continue; }

      // Motion / print / orientation
      if (v === "motion-safe")   { media.push("(prefers-reduced-motion:no-preference)"); continue; }
      if (v === "motion-reduce") { media.push("(prefers-reduced-motion:reduce)"); continue; }
      if (v === "portrait")      { media.push("(orientation:portrait)"); continue; }
      if (v === "landscape")     { media.push("(orientation:landscape)"); continue; }
      if (v === "print")         { media.push("print"); continue; }

      // Pseudo
      if (PSEUDO[v]) { sel += PSEUDO[v]; continue; }

      // group-hover, peer-focus, etc.
      if (startsWith(v, "group-")) {
        var gs = v.slice(6);
        sel = ".group" + (PSEUDO[gs] || ":" + gs) + " " + sel;
        continue;
      }
      if (startsWith(v, "peer-")) {
        var ps = v.slice(5);
        sel = ".peer" + (PSEUDO[ps] || ":" + ps) + " ~ " + sel;
        continue;
      }

      // aria-* / data-*
      if (startsWith(v, "aria-")) { sel += "[aria-" + v.slice(5) + "=\"true\"]"; continue; }
      if (startsWith(v, "data-")) { sel += "[data-" + v.slice(5) + "]"; continue; }
    }

    return {selector: sel, media: media, dark: dark};
  }

  function cssEscape(val) {
    if (global.CSS && typeof global.CSS.escape === "function") return global.CSS.escape(val);
    return String(val).replace(/([^a-zA-Z0-9_-])/g, "\\$1");
  }

  // ─── CSS GENERATION ────────────────────────────────────────────────────────

  function buildCSS(token, parsed, utility, scopePrefix) {
    var ctx = buildContext(token, parsed, scopePrefix);
    var important = config.important || parsed.important;

    // Alias (custom utility expansion)
    if (utility.aliasTokens) {
      var parts = utility.aliasTokens;
      var out = "";
      for (var i = 0; i < parts.length; i++) {
        var aliasBase = parsed.important && parts[i].charAt(0) !== "!" ? "!" + parts[i] : parts[i];
        var aliasToken = parsed.variants.length ? parsed.variants.join(":") + ":" + aliasBase : aliasBase;
        out += compileToken(aliasToken, ctx.selector, scopePrefix) || "";
      }
      return out;
    }

    var rules = utility.rules || [{selector:"&", declarations: utility.declarations || utility}];
    var chunks = [];
    if (utility.keyframes) chunks.push(utility.keyframes);

    for (var r = 0; r < rules.length; r++) {
      var rule = rules[r];
      var rSel = rule.selector ? rule.selector.replace(/&/g, ctx.selector) : ctx.selector;
      var decls = declsToString(typeof rule.declarations === "string" ? rule.declarations : rule.declarations, important);
      if (decls) chunks.push(wrapInMediaDark(rSel + "{" + decls + "}", ctx));
    }

    return chunks.join("");
  }

  function wrapInMediaDark(css, ctx) {
    var out = css;

    // Dark mode wrapping (correct order: dark THEN media)
    if (ctx.dark) {
      var dm = config.darkMode || "media";
      if (dm === "class") {
        out = ".dark " + out;
      } else if (dm === "media") {
        out = "@media (prefers-color-scheme:dark){" + out + "}";
      } else { // both
        out = ".dark " + out + "@media (prefers-color-scheme:dark){" + out + "}";
      }
    }

    // Responsive media wrapping (outermost)
    for (var m = ctx.media.length - 1; m >= 0; m--) {
      out = "@media " + ctx.media[m] + "{" + out + "}";
    }

    return out;
  }

  function declsToString(decls, important) {
    if (!decls) return "";
    if (typeof decls === "string") return decls;
    var sfx = important ? "!important" : "";
    var s = "";
    var keys = Object.keys(decls);
    for (var i = 0; i < keys.length; i++) {
      var v = decls[keys[i]];
      if (v === null || v === undefined || v === "") continue;
      s += keys[i] + ":" + v + sfx + ";";
    }
    return s;
  }

  // ─── MAIN COMPILER ─────────────────────────────────────────────────────────

  function compileToken(token, selectorOverride, scopePrefix) {
    if (!token || typeof token !== "string") return "";
    try {
      var parsed = parseToken(token);
      var base   = parsed.base;

      // Custom user utilities (aliases)
      var customUtil = config.utilities && config.utilities[base];
      if (customUtil) {
        var normalized = normalizeCustom(customUtil);
        if (!normalized) return "";
        if (selectorOverride) normalized._selectorOverride = selectorOverride;
        return buildCSS(token, parsed, normalized, scopePrefix);
      }

      // Static map
      var staticDecls = staticMap[base];
      if (staticDecls) {
        var ctx = buildContext(token, parsed, scopePrefix);
        if (selectorOverride) ctx.selector = selectorOverride;
        var decls = declsToString(staticDecls, config.important || parsed.important);
        return decls ? wrapInMediaDark(ctx.selector + "{" + decls + "}", ctx) : "";
      }

      // Dynamic resolver
      var neg = base.charAt(0) === "-";
      var lookupBase = neg ? base.slice(1) : base;
      var dyn = resolveDynamic(lookupBase, neg, config.theme);
      if (!dyn) {
        warnToken(token, "No matching utility.");
        return "";
      }

      var ctx2 = buildContext(token, parsed, scopePrefix);
      if (selectorOverride) ctx2.selector = selectorOverride;
      return buildCSS(token, parsed, dyn, scopePrefix);

    } catch (err) {
      warnToken(token, err && err.message ? err.message : "Compile error");
      return "";
    }
  }

  function normalizeCustom(val) {
    if (typeof val === "string") {
      var t = val.trim();
      if (!t) return null;
      if (t.indexOf(";") !== -1 || t.indexOf("{") !== -1) return {declarations: t};
      return {aliasTokens: splitClasses(t)};
    }
    if (Array.isArray(val)) {
      var tokens = [];
      for (var i = 0; i < val.length; i++) { if (typeof val[i] === "string") tokens = tokens.concat(splitClasses(val[i])); }
      return {aliasTokens: tokens};
    }
    if (val && typeof val === "object") {
      if (val.aliasTokens || val.declarations || val.rules) return val;
      return {declarations: val};
    }
    return null;
  }

  // ─── APPLY (component classes) ─────────────────────────────────────────────

  function renderApply() {
    var applyMap = config.apply || {};
    var css = "";
    var keys = Object.keys(applyMap);
    for (var i = 0; i < keys.length; i++) {
      var selector = keys[i];
      var classes   = applyMap[selector];
      var tokens    = splitClasses(String(classes));
      for (var t = 0; t < tokens.length; t++) {
        css += compileToken(tokens[t], selector, null) || "";
      }
    }
    return css;
  }

  // ─── SCOPED MODE ───────────────────────────────────────────────────────────
  // jf-scope-[name] on a container: all JetFlow styles inside are prefixed with .jf-scope-[name]

  var SCOPE_RE = /^jf-scope-\[([A-Za-z0-9_-]+)\]$/;

  function getScopePrefix(classList) {
    var classes = splitClasses(classList);
    for (var i = 0; i < classes.length; i++) {
      var m = SCOPE_RE.exec(classes[i]);
      if (m) return ".jf-scope-" + m[1];
    }
    return null;
  }

  // ─── DOM ENGINE ────────────────────────────────────────────────────────────

  var tokenCache    = new Map();   // token+scope → CSS string
  var ruleSet       = new Set();   // deduplication of inserted CSS rules
  var processedEls  = typeof WeakSet !== "undefined" ? new WeakSet() : null; // track processed elements
  var nodeTokenMap  = typeof WeakMap !== "undefined" ? new WeakMap() : null; // node → {tokens, scopePrefix}
  var pendingTokens = new Map();   // key → {token, scopePrefix}
  var styleEl       = null;
  var scheduled     = false;
  var observer      = null;
  var started       = false;
  var warnedTokens  = new Set();

  function ensureStyle() {
    if (styleEl && styleEl.parentNode) return;
    styleEl = document.getElementById(STYLE_ID);
    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = STYLE_ID;
      styleEl.setAttribute("data-jf", VERSION);
      (document.head || document.documentElement).appendChild(styleEl);
    }
  }

  function scanElement(el) {
    if (!el || el.nodeType !== 1) return;
    var cls = el.getAttribute("class") || "";
    var scopePrefix = getScopePrefix(cls);
    var tokens = splitClasses(cls).filter(function(t) { return !SCOPE_RE.test(t); });

    if (nodeTokenMap) nodeTokenMap.set(el, {tokens: tokens, scopePrefix: scopePrefix});
    if (processedEls) processedEls.add(el);

    for (var i = 0; i < tokens.length; i++) {
      var key = tokens[i] + "\x00" + (scopePrefix || "");
      if (!pendingTokens.has(key)) {
        pendingTokens.set(key, {token: tokens[i], scopePrefix: scopePrefix});
      }
    }
  }

  function scanDOM() {
    pendingTokens.clear();
    if (nodeTokenMap && typeof WeakMap !== "undefined") {
      // Re-create WeakMap (can't clear, but old entries GC'd)
    }
    var all = document.querySelectorAll("[class]");
    for (var i = 0; i < all.length; i++) scanElement(all[i]);
    // Safelist
    var sl = config.safelist || [];
    for (var s = 0; s < sl.length; s++) {
      if (typeof sl[s] !== "string") continue;
      var tks = splitClasses(sl[s]);
      for (var t = 0; t < tks.length; t++) {
        var key = tks[t] + "\x00";
        if (!pendingTokens.has(key)) pendingTokens.set(key, {token: tks[t], scopePrefix: null});
      }
    }
  }

  function flush() {
    ensureStyle();
    var parts = [];

    if (config.reset !== false) parts.push(RESET_CSS);

    // Theme CSS variables on :root
    parts.push(buildThemeVars());

    // Apply (component classes)
    parts.push(renderApply());

    // Compile pending tokens (batched)
    pendingTokens.forEach(function(entry, key) {
      if (tokenCache.has(key)) {
        var cached = tokenCache.get(key);
        if (cached && !ruleSet.has(cached)) { ruleSet.add(cached); parts.push(cached); }
        return;
      }
      var css = compileToken(entry.token, null, entry.scopePrefix) || "";
      tokenCache.set(key, css);
      if (css && !ruleSet.has(css)) { ruleSet.add(css); parts.push(css); }
    });

    var next = parts.filter(Boolean).join("\n");
    if (styleEl && styleEl.textContent !== next) styleEl.textContent = next;
    return next;
  }

  function scheduleFlush() {
    if (scheduled) return;
    scheduled = true;
    var run = global.requestAnimationFrame || function(fn) { global.setTimeout(fn, config.mutationDebounce || 16); };
    run(function() { scheduled = false; flush(); });
  }

  // ─── THEME VARIABLES ───────────────────────────────────────────────────────

  function buildThemeVars() {
    // Expose key theme values as CSS custom properties for runtime theming
    var t = config.theme;
    var css = ":root{";
    // Colors
    flattenColors(t.colors || {}, "--jf-color-", function(k, v) { css += k + ":" + v + ";"; });
    css += "}";
    return css;
  }

  function flattenColors(obj, prefix, cb) {
    var keys = Object.keys(obj);
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      var v = obj[k];
      if (typeof v === "string") cb(prefix + k, v);
      else if (v && typeof v === "object") flattenColors(v, prefix + k + "-", cb);
    }
  }

  // ─── MUTATIONOBSERVER (only new/changed nodes) ─────────────────────────────

  function start() {
    if (started) { flush(); return JetFlow; }
    started = true;
    ensureStyle();
    scanDOM();
    flush();

    observer = new MutationObserver(function(mutations) {
      var dirty = false;
      for (var i = 0; i < mutations.length; i++) {
        var m = mutations[i];
        if (m.type === "childList") {
          // Only process NEW added nodes, not the whole DOM
          for (var a = 0; a < m.addedNodes.length; a++) {
            var node = m.addedNodes[a];
            if (node.nodeType === 1) {
              scanElement(node);
              // Also scan children of added subtree
              var children = node.querySelectorAll ? node.querySelectorAll("[class]") : [];
              for (var c = 0; c < children.length; c++) scanElement(children[c]);
              dirty = true;
            }
          }
        } else if (m.type === "attributes" && m.attributeName === "class") {
          // Only re-process the changed element
          if (m.target && m.target.nodeType === 1) {
            scanElement(m.target);
            dirty = true;
          }
        }
      }
      if (dirty) scheduleFlush();
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class"]
    });

    return JetFlow;
  }

  function stop() {
    if (observer) observer.disconnect();
    observer = null;
    started = false;
    return JetFlow;
  }

  // ─── CONFIG ────────────────────────────────────────────────────────────────

  var config = {};
  var staticMap = {};

  function applyConfig(userCfg) {
    config = deepMerge(deepClone(DEFAULT_CONFIG), userCfg || {});
    if (userCfg && userCfg.theme && userCfg.theme.extend) {
      delete config.theme.extend;
      config.theme = deepMerge(config.theme, userCfg.theme.extend);
    }
    staticMap = buildStaticMap();
    // Clear caches on config change
    tokenCache.clear();
    ruleSet.clear();
    warnedTokens.clear();
    JetFlow.config = config;
  }

  function deepMerge(target) {
    for (var i = 1; i < arguments.length; i++) {
      var src = arguments[i];
      if (!src || typeof src !== "object") continue;
      var keys = Object.keys(src);
      for (var k = 0; k < keys.length; k++) {
        var key = keys[k];
        if (key === "__proto__" || key === "constructor" || key === "prototype") continue;
        var val = src[key];
        if (Array.isArray(val)) {
          target[key] = val.slice();
        } else if (val && typeof val === "object" && !Array.isArray(val)) {
          if (!target[key] || typeof target[key] !== "object") target[key] = {};
          deepMerge(target[key], val);
        } else {
          target[key] = val;
        }
      }
    }
    return target;
  }

  function deepClone(v) {
    if (Array.isArray(v)) return v.map(deepClone);
    if (v && typeof v === "object") {
      var o = {};
      var keys = Object.keys(v);
      for (var i = 0; i < keys.length; i++) o[keys[i]] = deepClone(v[keys[i]]);
      return o;
    }
    return v;
  }

  function warnToken(token, msg) {
    if (!config.debug) return;
    var key = token + "::" + msg;
    if (warnedTokens.has(key)) return;
    warnedTokens.add(key);
    if (global.console && global.console.warn) global.console.warn("[JetFlow] Ignored \"" + token + "\": " + msg);
  }

  // ─── UNIQUE FEATURES ──────────────────────────────────────────────────────

  // 1. Runtime theme switching: Jetflow.setTheme({...})
  //    Injects/updates CSS vars on :root without page reload.
  function setTheme(themeOverrides) {
    if (!themeOverrides || typeof themeOverrides !== "object") return JetFlow;
    deepMerge(config.theme, themeOverrides);
    // Extend color vars
    ensureStyle();
    var themeVarEl = document.getElementById("jf-theme-vars");
    if (!themeVarEl) {
      themeVarEl = document.createElement("style");
      themeVarEl.id = "jf-theme-vars";
      (document.head || document.documentElement).appendChild(themeVarEl);
    }
    var css = ":root{";
    if (themeOverrides.colors) {
      flattenColors(themeOverrides.colors, "--jf-color-", function(k, v) { css += k + ":" + v + ";"; });
    }
    // Allow arbitrary CSS variable overrides via theme.vars
    if (themeOverrides.vars && typeof themeOverrides.vars === "object") {
      var vkeys = Object.keys(themeOverrides.vars);
      for (var i = 0; i < vkeys.length; i++) {
        var propName = startsWith(vkeys[i], "--") ? vkeys[i] : "--jf-" + vkeys[i];
        css += propName + ":" + themeOverrides.vars[vkeys[i]] + ";";
      }
    }
    css += "}";
    themeVarEl.textContent = css;
    // Bust cache and re-flush
    tokenCache.clear();
    ruleSet.clear();
    scanDOM();
    flush();
    return JetFlow;
  }

  // 2. Dev inspect: Jetflow.inspect(element)
  //    Logs parsed classes and generated CSS for each class on an element.
  function inspect(el) {
    if (!el || el.nodeType !== 1) {
      console.warn("[JetFlow] inspect() requires a DOM element.");
      return;
    }
    var cls = el.getAttribute("class") || "";
    var scopePrefix = getScopePrefix(cls);
    var tokens = splitClasses(cls).filter(function(t) { return !SCOPE_RE.test(t); });

    console.group("[JetFlow] inspect(" + (el.tagName || "?").toLowerCase() + (el.id ? "#" + el.id : "") + ")");
    console.log("Scope prefix:", scopePrefix || "(none)");
    console.log("Classes:", tokens);
    for (var i = 0; i < tokens.length; i++) {
      var t = tokens[i];
      var parsed = parseToken(t);
      var css = compileToken(t, null, scopePrefix) || "(no output)";
      console.group("." + t);
      console.log("Parsed:", {
        raw:       parsed.raw,
        variants:  parsed.variants,
        utility:   parsed.utility,
        value:     parsed.value,
        important: parsed.important
      });
      console.log("CSS output:\n" + css);
      console.groupEnd();
    }
    console.groupEnd();
    return tokens.map(function(t) {
      return {token: t, parsed: parseToken(t), css: compileToken(t, null, scopePrefix) || ""};
    });
  }

  // ─── PUBLIC API ────────────────────────────────────────────────────────────

  var JetFlow = {
    version: VERSION,
    config: config,

    // Lifecycle
    start: start,
    stop: stop,
    refresh: function() { scanDOM(); flush(); return JetFlow; },
    scan: function() { scanDOM(); flush(); return JetFlow; },

    // Config
    configure: function(cfg) { applyConfig(deepMerge(deepClone(config), cfg || {})); if (started) { scanDOM(); flush(); } return JetFlow; },
    init: function(cfg) { applyConfig(cfg); if (started) { scanDOM(); flush(); } return JetFlow; },

    // Unique features
    setTheme: setTheme,
    inspect:  inspect,

    // Low-level access
    parseToken: parseToken,
    compileClass: function(token) { return compileToken(token, null, null); },
    clearCache: function() { tokenCache.clear(); ruleSet.clear(); return JetFlow; },

    // Parser module (matches required interface)
    parser: {
      parse: parseToken,
      // Returns: { variants: string[], utility: string, value: string, important: bool, raw: string }
      parseChained: function(token) {
        var p = parseToken(token);
        return {
          variants:  p.variants,   // ordered: media → pseudo
          utility:   p.utility,
          value:     p.value,
          important: p.important,
          raw:       p.raw
        };
      },
      splitClasses: splitClasses,
      splitOutside: splitOutside
    }
  };

  // ─── BOOT ──────────────────────────────────────────────────────────────────

  applyConfig(
    typeof _userConfig !== "undefined" ? _userConfig :
    (global.jetflowConfig || {})
  );

  global.JetFlow = JetFlow;

  // Auto-start on DOMContentLoaded (or immediately if already loaded)
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { start(); }, {once: true});
  } else {
    start();
  }

})(typeof window !== "undefined" ? window : this,
   typeof document !== "undefined" ? document : null);