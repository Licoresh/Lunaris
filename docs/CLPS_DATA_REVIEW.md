# CLPS dataset review — 2026-10-08

The catalog is a curated set of five deliveries, not the entire CLPS program. Mission source links are stored with each record in `src/lib/missions.ts` and shown in the mission brief. Payload descriptions are concise paraphrases of the linked NASA science manifest for their host mission; categories are editorial navigation aids. Results are deliberately selective rather than a complete literature review.

- Peregrine: NASA delivery registry and updated TO2-AB manifest establish five payloads, launch and no lunar landing. Provider page records Earth re-entry. Planned Sinus Viscositatis is not represented as an actual site.
- IM-1: NASA delivery registry establishes dates and six payloads. NASA program overview describes the completed delivery. LRO Camera team's primary observation at https://lroc.im-ldi.com/images/1360 supports 80.13 S, 1.44 E; this is an actual point, not a landing ellipse.
- Blue Ghost 1: NASA March 2, 2025 landing release and March 18 mission-conclusion release establish launch/landing dates, outcome and initial LuGRE/EDS results. TO19D science page provides ten payloads. Precise landing coordinates have not been verified for this catalog and remain null.
- IM-2: NASA March 7, 2025 outcome release and NASA PDS Athena context establish landing limitations, drill result and actual coordinates 84.79 S, 29.20 E. PDS explicitly gives February 27 UTC launch (February 26 local US time). Three instruments = TRIDENT + MSOLO (PRIME-1 suite) + LRA. Commercial payloads are outside this count.
- IM-3: NASA CP-11 page, updated July 15, 2026, describes a planned 2026 Reiner Gamma delivery with four payloads, including ESA and KASI contributions. No exact confirmed launch/landing date is asserted. Recheck the schedule before presenting; a planning window is not an event.

Status filters are editorial outcome groups, not quotations of a universal NASA status taxonomy. Peregrine and IM-2 are `Unsuccessful` in respect of their intended delivery/surface program, while their briefs acknowledge returned data. NASA sometimes labels any ended mission `Completed`; that does not imply all objectives succeeded. IM-1 is `Completed` with limitations explicitly shown.

Some NASA provider entries retain old 2024/2025 scheduled dates. These were not used as current event dates. Blue Ghost 2 manifests disagree about two versus three payloads across source pages; that mission was omitted rather than silently resolving the disagreement. Unknown coordinates, results and exact future dates are not filled with estimates.

All event dates shown in this catalog use UTC. `verified` means source-page review on that date, not independent scientific reprocessing or a guarantee of a live schedule. Source links are external and may change. Updating data requires checking each affected mission's outcome, manifest, coordinates and source dates together.
