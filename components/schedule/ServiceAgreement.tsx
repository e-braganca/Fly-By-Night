import Image from "next/image";
import { AGREEMENT_HEADER, SERVICE_AGREEMENT } from "@/lib/data/serviceAgreement";

/** Renders the full Fly by Night Fuel Service Agreement, styled to the brand.
    Callers wrap this in a scroll container (the agreement is long). */
export function ServiceAgreement() {
  return (
    <div>
      {/* Title band */}
      <div className="rounded-xl bg-primary px-5 py-6 text-center text-white">
        <Image
          src="/brand/emblem.svg"
          alt=""
          width={44}
          height={44}
          className="mx-auto mb-3"
        />
        <p className="text-sm font-bold uppercase tracking-[0.12em]">
          {AGREEMENT_HEADER.brand}
        </p>
        <p className="text-xs text-white/70">{AGREEMENT_HEADER.entity}</p>
        <h3 className="mx-auto mt-3 max-w-xs text-[15px] font-bold uppercase leading-snug tracking-wide">
          {AGREEMENT_HEADER.title}
        </h3>
        <p className="mt-2 text-xs text-white/80">{AGREEMENT_HEADER.subtitle}</p>
      </div>

      {/* Body */}
      <div className="mt-5 flex flex-col gap-2.5">
        {SERVICE_AGREEMENT.map((b, i) => {
          if (b.type === "heading") {
            return (
              <h4
                key={i}
                className="mt-4 border-t border-grey-500/16 pt-4 text-sm font-bold text-text-primary first:mt-0 first:border-0 first:pt-0"
              >
                {b.text}
              </h4>
            );
          }
          if (b.type === "callout") {
            return (
              <p
                key={i}
                className="rounded-lg border-l-4 border-secondary bg-secondary-lighter px-4 py-3 text-[12.5px] font-semibold leading-relaxed text-secondary-dark"
              >
                {b.text}
              </p>
            );
          }
          if (b.type === "bullet") {
            return (
              <div
                key={i}
                className="flex gap-2.5 pl-1 text-[13px] leading-relaxed text-text-secondary"
              >
                <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
                <span>{b.text}</span>
              </div>
            );
          }
          return (
            <p key={i} className="text-[13px] leading-relaxed text-text-secondary">
              {b.text}
            </p>
          );
        })}
      </div>
    </div>
  );
}
