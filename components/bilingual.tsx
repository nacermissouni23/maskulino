"use client";

/** Bilingual FR (left, LTR) + AR (right, RTL) field label. Phone-first: wraps cleanly. */
export function FieldLabel({ fr, ar }: { fr: string; ar: string }) {
  return (
    <span className="label-row">
      <span className="label-fr">{fr}</span>
      <span className="label-ar" dir="rtl" lang="ar">
        {ar}
      </span>
    </span>
  );
}
