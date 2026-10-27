import { jumpHandler } from "../utils/jump.js";
import "./Contacts.css";

/*
  Light block from Figma montÉrre (342:59) y:22701.972 through frame end 24302.
  Dock target #contacts-logo matches image 36 2 — sticky SiteLogo settles here.
*/

const NAV = [
  { label: "Home", id: "top" },
  { label: "The collection", id: "collection" },
  { label: "The philosophy", id: "philosophy" },
  { label: "The estate", id: "estate" },
  { label: "The craft", id: "craft" },
  { label: "The interlude", id: "essence" },
];

const EXPLORE = [
  { label: "Membership", id: "membership" },
  { label: "Stables", id: "stables" },
  { label: "Arena", id: "arena" },
  { label: "Paddocks", id: "paddocks" },
  { label: "Clubhouse", id: "clubhouse" },
];

function IconMail() {
  return (
    <svg viewBox="0 0 20 16" aria-hidden="true">
      <path
        d="M1 1.5h18v13H1V1.5Zm0 0 9 7 9-7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
      />
    </svg>
  );
}

function IconIg() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <rect
        x="1.5"
        y="1.5"
        width="17"
        height="17"
        rx="5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <circle
        cx="10"
        cy="10"
        r="4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <circle cx="14.8" cy="5.2" r="1" fill="currentColor" />
    </svg>
  );
}

function IconPin() {
  return (
    <svg
      className="contacts__icon-pin"
      viewBox="0 0 16 20"
      aria-hidden="true"
    >
      <path
        d="M8 1.5c-3.3 0-6 2.6-6 5.8 0 4.3 6 11.2 6 11.2s6-6.9 6-11.2c0-3.2-2.7-5.8-6-5.8Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <circle
        cx="8"
        cy="7.2"
        r="2.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
      />
    </svg>
  );
}

export default function Contacts() {
  return (
    <section className="contacts" id="contacts" aria-label="Contacts">
      <h2 className="contacts__title">Montérre</h2>

      {/* Invisible dock — sticky SiteLogo settles here; never painted */}
      <span id="contacts-logo" className="contacts__logo" aria-hidden="true" />

      <div className="contacts__brand">
        <p className="contacts__club">Private equestrian club</p>
        <span className="contacts__rule" aria-hidden="true" />
        <p className="contacts__tag">
          Tradition in motion
          <br />
          Since 1928
        </p>
      </div>

      <p className="contacts__quote">
        Behind every great
        <br />
        horse stands a greater
        <br />
        connection
      </p>

      <nav className="contacts__nav" aria-label="Footer">
        <div className="contacts__col contacts__col--nav">
          <p className="contacts__heading">Navigation</p>
          <ul>
            {NAV.map((item) => (
              <li key={item.id}>
                <a href={`#${item.id}`} onClick={jumpHandler(item.id)}>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="contacts__col contacts__col--explore">
          <p className="contacts__heading">Explore</p>
          <ul>
            {EXPLORE.map((item) => (
              <li key={item.id}>
                <a href={`#${item.id}`} onClick={jumpHandler(item.id)}>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="contacts__col contacts__col--contact">
          <p className="contacts__heading">Contact</p>
          <ul>
            <li>
              <a
                className="contacts__with-icon"
                href="mailto:hello@monterre.com"
              >
                <IconMail />
                hello@monterre.com
              </a>
            </li>
            <li>
              <a
                className="contacts__with-icon"
                href="https://instagram.com/monterre.club"
                target="_blank"
                rel="noreferrer"
              >
                <IconIg />
                @monterre.club
              </a>
            </li>
            <li>
              <span className="contacts__with-icon">
                <IconPin />
                Gomel, Belarus
              </span>
            </li>
          </ul>
        </div>
      </nav>

      <div className="contacts__foot">
        <p className="contacts__copy">© 2028 Montérre. All rights reserved.</p>
        <a className="contacts__legal" href="#contacts">
          Privacy policy · Terms
          <svg viewBox="0 0 79 12" aria-hidden="true">
            <path d="M0 6h70M66 2l8 4-8 4" />
          </svg>
        </a>
      </div>
    </section>
  );
}
