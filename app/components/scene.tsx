function Child({ x, y, shirt = "#91a9a2", girl = false, pose = false }: { x: number; y: number; shirt?: string; girl?: boolean; pose?: boolean }) {
  return <g transform={`translate(${x} ${y})`}>
    <ellipse cx="0" cy="93" rx="31" ry="6" fill="#57523b" opacity=".1" />
    <path d="M-16 50l-3 36h13l7-34 M5 50l4 36h13l-5-36" fill="#727b7c" />
    <path d="M-21 85h16v8h-22q-1-5 6-8 M9 85h14l6 8H9" fill="#ede8d9" stroke="#9c9587" strokeWidth="1" />
    {girl && <path d="M-23-20Q-33 4-24 31L24 31Q34 4 22-20Z" fill="#574334" />}
    <path d="M-19 16Q0 7 20 17l4 39h-48z" fill={shirt} />
    <path d={pose ? "M-18 21-35 38-49 24 M19 21l22 15 12-12" : "M-18 23-29 49 M19 23l14 25"} fill="none" stroke="#dba984" strokeWidth="10" strokeLinecap="round" />
    <rect x="-6" y="6" width="12" height="14" rx="4" fill="#dba984" />
    <ellipse cy="-8" rx="23" ry="27" fill="#e5b491" />
    <path d="M-23-8q-8-31 18-32 32-4 29 32L14-24Q-3-12-17-21z" fill="#574334" />
    <path d="M-20-9q-7-9-7 1t8 9 M20-9q7-9 7 1t-8 9" fill="#e5b491" />
    <path d="M-10-5h1 M9-5h1" stroke="#4e4035" strokeWidth="3.5" strokeLinecap="round" />
    <path d="M-5 5q5 5 10 0" fill="none" stroke="#95634d" strokeWidth="1.8" strokeLinecap="round" />
    <ellipse cx="-13" cy="4" rx="4" ry="2" fill="#cf8e77" opacity=".45" /><ellipse cx="14" cy="4" rx="4" ry="2" fill="#cf8e77" opacity=".45" />
  </g>;
}
function Plant({ x, y }: { x: number; y: number }) {
  return <g transform={`translate(${x} ${y})`}><path d="M0 0v-56 M0-18l-17-17 M0-29l18-17" stroke="#7b9271" strokeWidth="3" /><ellipse cx="-13" cy="-39" rx="8" ry="17" transform="rotate(-40 -13 -39)" fill="#a5b393" /><ellipse cx="13" cy="-47" rx="8" ry="17" transform="rotate(40 13 -47)" fill="#879f81" /><ellipse cy="-62" rx="7" ry="14" fill="#91a787" /><path d="M-15 0h30l-4 25h-22z" fill="#be9176" /></g>;
}
export default function Scene({ variant = 0, title, large = false }: { variant?: number; title: string; large?: boolean }) {
  const outdoor = variant === 1 || variant === 5;
  return <svg className={`scene ${large ? "scene-large" : ""}`} viewBox="0 0 480 240" role="img" aria-label={title}>
    <rect width="480" height="240" fill={outdoor ? "#e5eddf" : "#eee8db"} />
    <rect y="174" width="480" height="66" fill={outdoor ? "#cbd5b1" : "#ded1ba"} />
    <path d="M0 176h480" stroke="#c5bba6" opacity=".5" />
    {outdoor ? <>
      <path d="M0 70Q100 25 180 78T480 55v119H0z" fill="#d4ddc5" />
      <path d="M43 170V50 M425 176V47" stroke="#a6a084" strokeWidth="12" />
      <g fill="#a8bc96"><circle cx="40" cy="49" r="51"/><circle cx="7" cy="79" r="43"/><circle cx="438" cy="48" r="55"/></g>
      <path d="M68 149h118v9H68z M78 159v29 M174 159v29" stroke="#b09575" strokeWidth="7" />
      <path d="M220 240q50-47 108-66" stroke="#e4dec8" strokeWidth="42" fill="none" />
      {variant === 5 && <g stroke="#98afbc" strokeWidth="2" opacity=".65">{[60,120,180,240,300,360,420].map(x=><path key={x} d={`m${x} 22-5 13 m15 30-5 13`}/>)}</g>}
    </> : <>
      <rect x="30" y="22" width="112" height="115" rx="3" fill="#cfbea0"/><rect x="37" y="29" width="98" height="101" fill="#dce8e5"/>
      <path d="M87 29v101 M37 78h98" stroke="#faf6e9" strokeWidth="6"/><path d="m42 111 38-29 37 15 18-7v36H42z" fill="#bbcbb2" />
      <rect x="345" y="54" width="108" height="118" rx="3" fill="#c9b08d"/><path d="M350 94h98 M350 135h98" stroke="#ad9170" strokeWidth="5" />
      <g fill="#a2ad94"><rect x="356" y="66" width="12" height="25" rx="1"/><rect x="371" y="70" width="10" height="21" rx="1"/><rect x="385" y="62" width="13" height="29" rx="1"/></g>
      <rect x="405" y="72" width="28" height="19" rx="4" fill="#e6d5b3"/><rect x="359" y="111" width="37" height="20" rx="4" fill="#d9c9a9"/><rect x="409" y="102" width="24" height="29" rx="3" fill="#aab8b4"/>
      <Plant x={319} y={154}/>
      <rect x="199" y="31" width="66" height="48" rx="2" fill="#d0b895"/><rect x="204" y="36" width="56" height="38" fill="#f7f0dd"/><path d="m212 65 14-18 13 13 14-10" fill="none" stroke="#a4b28e" strokeWidth="3"/>
    </>}
    {variant === 0 && <><ellipse cx="223" cy="213" rx="99" ry="20" fill="#c6baa1" opacity=".55"/><Child x={175} y={127} shirt="#92a9ac" pose/><Child x={285} y={107} shirt="#c0a681"/><g stroke="#aa8768" strokeWidth="1"><rect x="212" y="180" width="23" height="24" fill="#c99c74"/><rect x="239" y="194" width="23" height="22" fill="#a1b6ad"/><rect x="225" y="154" width="23" height="24" fill="#d1ba87" transform="rotate(15 236 166)"/><rect x="190" y="210" width="22" height="20" fill="#b1b896" transform="rotate(-12 200 220)"/></g></>}
    {variant === 1 && <><Child x={205} y={113} shirt="#c5a37f" girl pose/><Child x={315} y={110} shirt="#92aba4" pose/><circle cx="256" cy="209" r="18" fill="#e7d5a1"/><path d="m249 195 15 5-2 15-15-2z" fill="#9fb2ad"/></>}
    {variant === 2 && <><rect x="50" y="149" width="188" height="53" rx="12" fill="#b3bda5"/><rect x="52" y="112" width="172" height="56" rx="13" fill="#bec7b0"/><rect x="64" y="124" width="63" height="38" rx="9" fill="#e2d9c3"/><path d="M62 201v17 M223 201v17" stroke="#aa9578" strokeWidth="6"/><Child x={281} y={121} shirt="#c7a098" girl/><path d="m152 177 32-4 25 22-48 4z" fill="#e6d7b9"/></>}
    {variant === 3 && <><Child x={206} y={119} shirt="#b4ad91" pose/><path d="m278 200 39-12 10 8-39 13z" fill="#a2adb0"/><path d="m313 179 7-12 M329 188l12-5 M295 174l-1-11" stroke="#a29c83" strokeWidth="3" strokeLinecap="round"/><rect x="55" y="165" width="82" height="10" rx="3" fill="#b99b75"/><path d="M66 175v43 M127 175v43" stroke="#b99b75" strokeWidth="6"/></>}
    {variant === 4 && <><Child x={170} y={111} shirt="#a9b7a0" girl/><g transform="translate(290 -18) scale(1.15)"><Child x={0} y={115} shirt="#c0aa8c"/></g><rect x="100" y="173" width="260" height="13" rx="4" fill="#b79772"/><path d="M117 185v55 M342 185v55" stroke="#af8e6b" strokeWidth="9"/><path d="M195 152h60q-4 25-30 25t-30-25" fill="#e6e1cc"/><g fill="#b88857"><circle cx="283" cy="165" r="7"/><circle cx="307" cy="165" r="7"/></g></>}
    {variant === 5 && <><Child x={207} y={119} shirt="#b7aa91"/><Child x={302} y={95} shirt="#99aca0" girl/><path d="M245 75q57-82 113 0z" fill="#c3a77d"/><path d="M302 73v57q0 13-10 10" stroke="#8b826d" strokeWidth="3" fill="none"/></>}
    <rect width="480" height="240" fill="#f8f0da" opacity=".08" />
  </svg>;
}
