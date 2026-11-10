# US warehouse map: independent interface prototype

Open `index.html` in a modern browser. Use `index.html?mode=nearby` for the nearby concept. All UI copy is English; the Chinese feature plan is at `docs/fba-map-nearby-plan.md` in the project.

This prototype is separate from the existing website. It has not been deployed or integrated into the working FBA lookup tool.

## Data boundaries

- The FBA directory contains 87 public reference addresses across 27 states. The original file is `frontend/assets/data/fba-warehouses.us.json`; per-record sources are preserved here.
- Only 13 records have source coordinates. They require verification before a production nearby search; the remaining 74 need geocoding and checking.
- Nearby mode uses **Ontario, CA 91761 as its single sample query**. It does not geocode other addresses. Distances are spherical straight-line miles, not road distances or delivery times.
- Three 3PL entries are explicitly illustrative, with invented coordinates for interaction design. They identify no real operator, partner, street address or available capacity.
- Featured FBA entries are editorial selections, not a measured popularity ranking. The six 3PL hubs are proposed regional directory entry points.
- FBA delivery instructions and destination addresses must be confirmed against the Amazon shipment plan.

## Libraries and geographical sources

Local files are included so the prototype can render without network requests:

- D3 v7: <https://github.com/d3/d3> · license <https://github.com/d3/d3/blob/main/LICENSE>
- TopoJSON client v3: <https://github.com/topojson/topojson-client> · license <https://github.com/topojson/topojson-client/blob/master/LICENSE>
- US Atlas v3 state/county boundaries: <https://github.com/topojson/us-atlas> · license <https://github.com/topojson/us-atlas/blob/master/LICENSE>
- Distribution: <https://cdn.jsdelivr.net/npm/d3@7/dist/d3.min.js>, <https://cdn.jsdelivr.net/npm/topojson-client@3/dist/topojson-client.min.js>, and <https://cdn.jsdelivr.net/npm/us-atlas@3/>.

The map uses real geographic boundaries, with D3's composite US projection for the national view and a local Mercator projection for the Southern California sample. Alaska and Hawaii are insets in the national view.

## Preview exports

- `output/fba-map/us-state-map-concept-v1.png`
- `output/fba-map/us-nearby-warehouse-concept-v1.png`

Desktop and 390 px mobile previews checked for overflow and browser errors; prototype state selection, type filters, service filters, region tabs and radius changes checked independently of the application.
