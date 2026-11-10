"use client";

import { contact } from "@/lib/juanras/copy";
import { useSite } from "./Site";

export default function Footer() {
  const { t } = useSite();
  return (
    <footer className="jr-foot">
      <p className="jr-script jr-foot__mark" aria-hidden="true">The Juanras</p>
      <div className="jr-wrap jr-foot__row">
        <p>{t.footer.place}</p>
        <ul>
          <li><a className="jr-link" href={contact.phoneHref}>{contact.phone}</a></li>
          <li><a className="jr-link" href={`mailto:${contact.email}`}>{contact.email}</a></li>
        </ul>
        <ul>
          {contact.social.map((s) => (
            <li key={s.name}><a className="jr-link" href={s.href} target="_blank" rel="noreferrer">{s.name}</a></li>
          ))}
        </ul>
        <p className="jr-foot__legal">
          © {new Date().getFullYear()} The Juanras. {t.footer.rights} <a className="jr-link" href="#top">{t.footer.top}</a>
        </p>
      </div>
    </footer>
  );
}
