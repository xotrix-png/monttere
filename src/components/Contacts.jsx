import logo from "../assets/images/logo.png";
import "./Contacts.css";

/*
  Light block, Figma y:24243 through the frame end 25834.
  Column copy is still the placeholder text from the file.
*/
const COLUMNS = [
  {
    x: 141,
    lines: [
      { y: 1114.4, text: "Chto-to" },
      { y: 1206.4, text: "Chto-toChto-to" },
      { y: 1298.5, text: "Chto-to" },
      { y: 1390.5, text: "Chto-to" },
    ],
  },
  {
    x: 826.223,
    lines: [
      { y: 1114.4, text: "Chto-toChto-to" },
      { y: 1206.4, text: "Chto-to" },
    ],
  },
  {
    x: 1289.258,
    align: "right",
    width: 496,
    lines: [
      { y: 1114.4, text: "Chto-toChto-toChto-toChto" },
      { y: 1206.4, text: "Chto-to" },
      { y: 1298.5, text: "Chto-to" },
    ],
  },
];

export default function Contacts() {
  return (
    <section className="contacts" id="contacts" aria-label="Contacts">
      <p className="contacts__index">07</p>
      <h2 className="contacts__title">Contacts</h2>
      <img className="contacts__logo" src={logo} alt="" width={89} height={121} />
      {COLUMNS.map((column) => (
        <ul
          key={column.x}
          className="contacts__col"
          style={{
            left: `calc(${column.x} * var(--u))`,
            width: column.width ? `calc(${column.width} * var(--u))` : undefined,
            textAlign: column.align,
          }}
        >
          {column.lines.map((line) => (
            <li key={line.y} style={{ top: `calc(${line.y} * var(--u))` }}>
              {line.text}
            </li>
          ))}
        </ul>
      ))}
    </section>
  );
}
