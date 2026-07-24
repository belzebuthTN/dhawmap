import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import * as d3 from "d3";
import { Zap, MapPin, CheckCircle2, RefreshCw, Radio, Navigation, AlertTriangle, X, Plus, Minus, Maximize2 } from "lucide-react";

// ---------------------------------------------------------------------------
// Data: the 24 governorates of Tunisia with approximate centroid coordinates
// ---------------------------------------------------------------------------
const GOUVERNORATS = [
  { id: "tunis", name: "Tunis", lat: 36.8065, lon: 10.1815 },
  { id: "ariana", name: "Ariana", lat: 36.8625, lon: 10.1956 },
  { id: "benarous", name: "Ben Arous", lat: 36.7533, lon: 10.2282 },
  { id: "manouba", name: "Manouba", lat: 36.8081, lon: 10.0972 },
  { id: "nabeul", name: "Nabeul", lat: 36.4561, lon: 10.7376 },
  { id: "zaghouan", name: "Zaghouan", lat: 36.4028, lon: 10.1425 },
  { id: "bizerte", name: "Bizerte", lat: 37.2744, lon: 9.8739 },
  { id: "beja", name: "Béja", lat: 36.7256, lon: 9.1817 },
  { id: "jendouba", name: "Jendouba", lat: 36.5011, lon: 8.7803 },
  { id: "kef", name: "Le Kef", lat: 36.1826, lon: 8.7148 },
  { id: "siliana", name: "Siliana", lat: 36.0844, lon: 9.3708 },
  { id: "sousse", name: "Sousse", lat: 35.8256, lon: 10.6369 },
  { id: "monastir", name: "Monastir", lat: 35.7643, lon: 10.8113 },
  { id: "mahdia", name: "Mahdia", lat: 35.5047, lon: 11.0622 },
  { id: "sfax", name: "Sfax", lat: 34.7406, lon: 10.7603 },
  { id: "kairouan", name: "Kairouan", lat: 35.6781, lon: 10.0963 },
  { id: "kasserine", name: "Kasserine", lat: 35.1676, lon: 8.8365 },
  { id: "sidibouzid", name: "Sidi Bouzid", lat: 35.0381, lon: 9.4858 },
  { id: "gabes", name: "Gabès", lat: 33.8815, lon: 10.0982 },
  { id: "medenine", name: "Médenine", lat: 33.3548, lon: 10.5055 },
  { id: "tataouine", name: "Tataouine", lat: 32.9297, lon: 10.4518 },
  { id: "gafsa", name: "Gafsa", lat: 34.425, lon: 8.7842 },
  { id: "tozeur", name: "Tozeur", lat: 33.9197, lon: 8.1335 },
  { id: "kebili", name: "Kébili", lat: 33.7044, lon: 8.969 },
];

// Real Tunisia boundary (mainland + Djerba + Kerkennah), simplified from
// Natural Earth 1:50m admin-0 country data — accurate coastline, not hand-drawn.
const TUN_GEOM = {"type":"MultiPolygon","coordinates":[[[[11.505,33.182],[11.502,33.156],[11.467,32.966],[11.459,32.897],[11.454,32.782],[11.454,32.643],[11.534,32.525],[11.536,32.473],[11.505,32.414],[11.358,32.345],[11.168,32.257],[11.005,32.173],[10.826,32.081],[10.772,32.021],[10.683,31.975],[10.609,31.93],[10.596,31.886],[10.544,31.803],[10.476,31.736],[10.306,31.705],[10.275,31.685],[10.196,31.585],[10.16,31.546],[10.115,31.464],[10.173,31.251],[10.243,31.032],[10.257,30.941],[10.256,30.865],[10.216,30.783],[10.126,30.666],[10.06,30.58],[9.933,30.425],[9.895,30.387],[9.807,30.342],[9.638,30.282],[9.519,30.229],[9.458,30.465],[9.406,30.667],[9.363,30.833],[9.288,31.125],[9.224,31.374],[9.16,31.621],[9.102,31.846],[9.044,32.072],[9.019,32.105],[8.844,32.212],[8.683,32.31],[8.515,32.422],[8.333,32.544],[8.304,32.696],[8.211,32.927],[8.113,33.055],[8.076,33.089],[7.877,33.172],[7.763,33.233],[7.731,33.269],[7.709,33.362],[7.628,33.549],[7.534,33.718],[7.5,33.832],[7.496,33.977],[7.514,34.081],[7.554,34.125],[7.749,34.254],[7.838,34.41],[7.949,34.469],[8.046,34.513],[8.123,34.564],[8.193,34.646],[8.246,34.734],[8.255,34.829],[8.277,34.979],[8.312,35.085],[8.394,35.204],[8.36,35.3],[8.316,35.403],[8.329,35.582],[8.318,35.655],[8.283,35.719],[8.247,35.802],[8.246,35.871],[8.28,36.051],[8.307,36.189],[8.349,36.368],[8.334,36.418],[8.303,36.456],[8.209,36.495],[8.208,36.519],[8.231,36.545],[8.37,36.633],[8.444,36.761],[8.507,36.788],[8.601,36.834],[8.598,36.884],[8.577,36.937],[8.824,36.998],[9.059,37.156],[9.142,37.195],[9.688,37.34],[9.759,37.33],[9.838,37.309],[9.816,37.255],[9.784,37.211],[9.83,37.135],[9.896,37.182],[9.879,37.213],[9.876,37.254],[9.988,37.258],[10.087,37.251],[10.196,37.206],[10.189,37.034],[10.334,36.865],[10.293,36.781],[10.412,36.732],[10.518,36.791],[10.571,36.879],[10.766,36.93],[10.951,37.059],[11.054,37.073],[11.077,36.967],[11.127,36.874],[11.057,36.841],[10.967,36.743],[10.798,36.493],[10.642,36.42],[10.526,36.323],[10.488,36.255],[10.477,36.175],[10.506,36.032],[10.591,35.887],[10.689,35.8],[10.784,35.772],[11.004,35.634],[11.001,35.552],[11.032,35.454],[11.043,35.335],[11.12,35.24],[10.956,35.034],[10.866,34.884],[10.691,34.678],[10.535,34.545],[10.2,34.346],[10.118,34.28],[10.065,34.212],[10.04,34.14],[10.049,34.056],[10.159,33.85],[10.305,33.728],[10.454,33.663],[10.713,33.689],[10.704,33.61],[10.723,33.514],[10.828,33.519],[10.898,33.534],[10.958,33.626],[11.085,33.563],[11.15,33.369],[11.257,33.309],[11.27,33.286],[11.232,33.272],[11.203,33.249],[11.234,33.234],[11.338,33.209],[11.401,33.225],[11.505,33.182]]],[[[11.278,34.754],[11.124,34.682],[11.153,34.745],[11.255,34.82],[11.281,34.802],[11.278,34.754]]],[[[10.958,33.722],[10.931,33.717],[10.883,33.69],[10.857,33.687],[10.785,33.718],[10.757,33.717],[10.722,33.739],[10.734,33.856],[10.745,33.889],[10.922,33.893],[11.018,33.823],[11.034,33.805],[11.038,33.785],[10.993,33.746],[10.958,33.722]]]]};

const MAP_W = 480;
const MAP_H = 620;

// The 263 délégations of Tunisia, grouped by governorate id.
const DELEGATIONS = {"ariana":["Ariana Medina","Ettadhamen","Kalaat el Andalous","Mnihla","Raoued","Sidi Thabet","Soukra"],"benarous":["Ben Arous","Bou Mhel El Bassatine","El Mourouj","Ezzahra","Fouchana","Hammam Chôtt","Hammam Lif","La Nouvelle Medina","Megrine","Mohamedia","Mornag","Radès"],"bizerte":["Bizerte Nord","Bizerte Sud","Djoumine","El Alia","Ghar El Melh","Ghezala","Mateur","Menzel Bourguiba","Menzel Jemil","Ras Jabel","Sejenane","Tinja","Utique","Zarzouna"],"beja":["Amdoun","Béja Nord","Béja Sud","Goubellat","Medjez El Bab","Nefza","Teboursouk","Testour","Tibar"],"gabes":["El Hamma","El Metouia","Gabes Medina","Gabes Ouest","Gabes Sud","Ghannouch","Menzel El Habib","Mareth","Matmata","Nouvelle Matmata"],"gafsa":["Belkhir","El Guetar","El Ksar","Gafsa Nord","Gafsa Sud","Mdhilla","Metlaoui","Oum El Araies","Redeyef","Sidi Aïch","Sned"],"jendouba":["Aïn Draham","Balta-Bou Aouane","Bou Salem","Fernana","Ghardimaou","Jendouba Sud","Jendouba Nord","Oued Meliz","Tabarka"],"kairouan":["Alaâ","Bou Hajla","Chebika","Echrarda","Haffouz","Hajeb El Ayoun","Kairouan Nord","Kairouan Sud","Nasrallah","Oueslatia","Sbikha"],"kasserine":["El Ayoun","Ezzouhour","Fériana","Foussana","Haïdra","Hassi El Ferid","Jedelienne","Kasserine Nord","Kasserine Sud","Majel Bel Abbès","Sbeïtla","Sbiba","Thala"],"kebili":["Douz North","Douz South","Faouar","Kebili North","Kebili South","Souk El Ahed"],"kef":["Dahmani","Jérissa","El Ksour","Sers","Kalâat Khasba","Kalaat Senan","Kef Est","Kef Ouest","Nebeur","Sakiet Sidi Youssef","Tajerouine"],"mahdia":["Bou Merdès","Chebba","Chorbane","El Djem","Essouassi","Hebira","Ksour Essef","Mahdia","Melloulèche","Ouled Chamekh","Sidi Alouane"],"manouba":["Borj El Amri","Djedeida","Douar Hicher","El Battan","Manouba","Mornaguia","Oued Ellil","Tebourba"],"monastir":["Bekalta","Bembla","Beni Hassen","Jemmal","Ksar Hellal","Ksibet el-Médiouni","Moknine","Monastir","Ouerdanine","Sahline","Sayada-Lamta-Bou Hajar","Téboulba","Zéramdine"],"medenine":["Médenine Nord","Médenine Sur","Beni Khedech","Ben Guerdane","Zarzis","Djerba Houmet Souk","Djerba Midoun","Djerba Ajim","Sidi Makhloulf"],"nabeul":["Béni Khalled","Béni Khiar","Bou Argoub","Dar Châabane El Fehri","El Haouaria","El Mida","Grombalia","Hammamet","Hammam El Guezaz","Kélibia","Korba","Menzel Bouzelfa","Menzel Temime","Nabeul","Soliman","Takelsa"],"sfax":["Agareb","Bir Ali Ben Khalifa","El Amra","El Hencha","Graïba","Jebiniana","Kerkennah","Mahrès","Menzel Chaker","Sakiet Eddaïer","Sakiet Ezzit","Sfax Ouest","Sfax Sud","Sfax Ville","Skhira","Thyna"],"sidibouzid":["Bir El Hafey","Cebbala Ouled Asker","Jilma","Meknassy","Menzel Bouzaiane","Mezzouna","Ouled Haffouz","Regueb","Sidi Ali Ben Aoun","Sidi Bouzid Est","Sidi Bouzid Ouest","Souk Jedid"],"siliana":["Bargou","Bou Arada","El Aroussa","El Krib","Gaâfour","Kesra","Makthar","Rouhia","Sidi Bou Rouis","Siliana Nord","Siliana Sud"],"sousse":["Akouda","Bouficha","Enfida","Hammam Sousse","Hergla","Kalâa Kebira","Kalâa Seghira","Kondar","M'saken","Sidi Bou Ali","Sidi El Hani","Sousse Jawhara","Sousse Médina","Sousse Riadh","Sousse Sidi Abdelhamid"],"tataouine":["Bir Lahmar","Dehiba","Ghomrassen","Remada","Smâr","Tataouine Nord","Tataouine Sud"],"tozeur":["Degache","Hazoua","Nefta","Tameghza","Tozeur"],"tunis":["Bab El Bhar","Bab Souika","Carthage","Cité El Khadra","Djebel Jelloud","El Kabaria","El Menzah","El Omrane","El Omrane supérieur","El Ouardia","Ettahrir","Ezzouhour","Hraïria","La Goulette","La Marsa","Le Bardo","Le Kram","Médina","Séjoumi","Sidi El Béchir","Sidi Hassine"],"zaghouan":["Bir Mcherga","El Fahs","Nadhour","Saouaf","Zaghouan","Zriba"]};

const LOCATION_OPTIONS = {
  tunis: [
    { label: "El Menzah", lat: 36.836, lon: 10.177, streets: ["Avenue Habib Bourguiba", "Rue de l'Indépendance", "Rue du 15 Novembre"] },
    { label: "La Marsa", lat: 36.878, lon: 10.325, streets: ["Avenue de la Corniche", "Rue du 7 Novembre", "Avenue de la République"] },
    { label: "Carthage", lat: 36.857, lon: 10.327, streets: ["Avenue de Carthage", "Rue du Lac", "Rue de la Kasbah"] },
    { label: "Le Bardo", lat: 36.809, lon: 10.135, streets: ["Avenue Mohamed V", "Rue du 20 Mars", "Rue de la Liberté"] },
    { label: "Médina", lat: 36.799, lon: 10.165, streets: ["Rue de la Kasbah", "Rue des Oudin", "Rue Al Sidi Ben Arous"] },
  ],
  ariana: [
    { label: "Ariana Centre", lat: 36.862, lon: 10.195, streets: ["Avenue du 14 Janvier", "Rue de la Paix", "Rue du 2 Mars"] },
    { label: "Soukra", lat: 36.887, lon: 10.132, streets: ["Avenue de la République", "Rue de l'Indépendance", "Rue des Jardins"] },
  ],
  benarous: [
    { label: "Ben Arous", lat: 36.753, lon: 10.228, streets: ["Avenue de la République", "Rue de l'Indépendance", "Boulevard de Tunis"] },
    { label: "Mornag", lat: 36.728, lon: 10.260, streets: ["Rue de la Paix", "Rue de la Liberté", "Avenue du 14 Janvier"] },
  ],
  sousse: [
    { label: "Sousse Medina", lat: 35.825, lon: 10.637, streets: ["Rue de la Kasbah", "Avenue Hédi Chaker", "Rue de la République"] },
    { label: "Hammam Sousse", lat: 35.857, lon: 10.596, streets: ["Avenue du 7 Novembre", "Rue de la Paix", "Boulevard de la Mer"] },
  ],
  sfax: [
    { label: "Sfax Ville", lat: 34.740, lon: 10.760, streets: ["Avenue de la Liberté", "Rue de la République", "Avenue Bourguiba"] },
    { label: "Kerkennah", lat: 34.700, lon: 11.090, streets: ["Rue du Port", "Avenue de la Mer", "Rue principale"] },
  ],
  nabeul: [
    { label: "Hammamet", lat: 36.400, lon: 10.610, streets: ["Avenue de la Mer", "Rue de la Medina", "Boulevard de la Corniche"] },
    { label: "Nabeul Centre", lat: 36.455, lon: 10.738, streets: ["Rue de la République", "Avenue Habib Bourguiba", "Rue du 15 Novembre"] },
  ],
  monastir: [
    { label: "Monastir Centre", lat: 35.764, lon: 10.811, streets: ["Avenue de la République", "Rue de la Kasbah", "Boulevard de la Mer"] },
    { label: "Ksar Hellal", lat: 35.649, lon: 10.892, streets: ["Rue du 7 Novembre", "Avenue de la Paix", "Rue principale"] },
  ],
  default: [
    { label: "Centre-ville", lat: 36.8, lon: 10.18, streets: ["Rue principale", "Avenue principale", "Boulevard central"] },
  ],
};

function pickBestLocationOption(latitude, longitude, governorateId) {
  const options = LOCATION_OPTIONS[governorateId] ?? LOCATION_OPTIONS.default;
  let best = options[0];
  let bestD = Infinity;
  for (const opt of options) {
    const d = haversineSq(latitude, longitude, opt.lat, opt.lon);
    if (d < bestD) {
      bestD = d;
      best = opt;
    }
  }
  return best;
}


// ---------------------------------------------------------------------------
// Palette / tokens
// ---------------------------------------------------------------------------
const C = {
  bg: "#0E1224",
  bgPanel: "#161B34",
  bgPanel2: "#1D2444",
  line: "#2C3560",
  amber: "#F2C94C",
  amberDim: "#8A6E20",
  teal: "#4ECDC4",
  red: "#E8604C",
  text: "#F2F1EA",
  textDim: "#9AA0C0",
};

const displayFont = "'Trebuchet MS', 'Century Gothic', ui-sans-serif, sans-serif";
const bodyFont = "'Inter', ui-sans-serif, system-ui, sans-serif";

function haversineSq(lat1, lon1, lat2, lon2) {
  const dLat = lat1 - lat2, dLon = lon1 - lon2;
  return dLat * dLat + dLon * dLon;
}

function timeAgo(ts) {
  const s = Math.max(1, Math.floor((Date.now() - ts) / 1000));
  if (s < 60) return `il y a ${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `il y a ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `il y a ${h} h`;
  const d = Math.floor(h / 24);
  return `il y a ${d} j`;
}

const ACTIVE_WINDOW_MS = 3 * 60 * 60 * 1000; // 3h

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(err) {
    console.error("Dhawmap Live crashed:", err);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100vh",
            background: "#0E1224",
            color: "#F2F1EA",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: 10,
            padding: 24,
            textAlign: "center",
            fontFamily: bodyFont,
          }}
        >
          <p style={{ fontSize: 15 }}>Un souci est survenu dans l'aperçu.</p>
          <button
            onClick={() => this.setState({ hasError: false })}
            style={{
              background: "#F2C94C",
              color: "#1B1503",
              border: "none",
              borderRadius: 8,
              padding: "8px 14px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Réessayer
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ---------------------------------------------------------------------------
// TunisiaMap — real geo projection (D3) with wheel/pinch/drag zoom & pan.
// ---------------------------------------------------------------------------
function TunisiaMap({ gouvernorats, activeCounts, maxCount, selected, onSelect, userGouv }) {
  const svgRef = useRef(null);
  const gRef = useRef(null);
  const zoomRef = useRef(null);
  const [transform, setTransform] = useState(() => d3.zoomIdentity);

  const projection = useMemo(() => {
    return d3.geoMercator().fitExtent(
      [[16, 16], [MAP_W - 16, MAP_H - 16]],
      { type: "Feature", geometry: TUN_GEOM }
    );
  }, []);

  const pathGen = useMemo(() => d3.geoPath(projection), [projection]);
  const countryPath = useMemo(
    () => pathGen({ type: "Feature", geometry: TUN_GEOM }),
    [pathGen]
  );

  const points = useMemo(
    () =>
      gouvernorats.map((g) => {
        const [x, y] = projection([g.lon, g.lat]);
        return { ...g, x, y };
      }),
    [gouvernorats, projection]
  );

  useEffect(() => {
    const svgEl = svgRef.current;
    if (!svgEl) return;
    const zoom = d3
      .zoom()
      .scaleExtent([1, 9])
      .translateExtent([[0, 0], [MAP_W, MAP_H]])
      .on("zoom", (event) => setTransform(event.transform));
    d3.select(svgEl).call(zoom);
    zoomRef.current = zoom;
    return () => {
      d3.select(svgEl).on(".zoom", null);
    };
  }, []);

  const zoomBy = (factor) => {
    if (!zoomRef.current || !svgRef.current) return;
    d3.select(svgRef.current).transition().duration(220).call(zoomRef.current.scaleBy, factor);
  };
  const resetZoom = () => {
    if (!zoomRef.current || !svgRef.current) return;
    d3.select(svgRef.current).transition().duration(280).call(zoomRef.current.transform, d3.zoomIdentity);
  };

  const k = transform.k;

  return (
    <div style={{ position: "relative" }}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${MAP_W} ${MAP_H}`}
        width="100%"
        height="auto"
        className="map-svg"
        style={{ display: "block", touchAction: "none" }}
      >
        <defs>
          <pattern id="grid" width="16" height="16" patternUnits="userSpaceOnUse">
            <path d="M16 0 L0 0 0 16" fill="none" stroke={C.line} strokeWidth="0.5" opacity="0.4" />
          </pattern>
          <radialGradient id="seaGlow" cx="35%" cy="20%" r="80%">
            <stop offset="0%" stopColor={C.bgPanel2} />
            <stop offset="100%" stopColor={C.bg} />
          </radialGradient>
        </defs>
        <rect x="0" y="0" width={MAP_W} height={MAP_H} fill="url(#seaGlow)" />

        <g ref={gRef} transform={transform.toString()}>
          <path d={countryPath} fill="url(#grid)" stroke={C.amberDim} strokeWidth={1.2 / k} />
          <path d={countryPath} fill="none" stroke={C.amber} strokeWidth={0.6 / k} opacity="0.55" />

          {points.map((g) => {
            const count = activeCounts[g.id] ?? 0;
            const r = 4 + (count / maxCount) * 9;
            const isSel = selected === g.id;
            const isUser = userGouv === g.id;
            const color = count > 0 ? C.amber : C.textDim;
            const inv = 1 / k;
            return (
              <g
                key={g.id}
                transform={`translate(${g.x},${g.y})`}
                onClick={() => onSelect(isSel ? null : g.id)}
                style={{ cursor: "pointer" }}
              >
                <g transform={`scale(${inv})`}>
                  {count > 0 && (
                    <circle r={r + 6} fill={C.amber} className="signal-ring" opacity="0.25" />
                  )}
                  <circle
                    r={isSel ? r + 2 : r}
                    fill={color}
                    stroke={isUser ? C.teal : "#0000"}
                    strokeWidth={isUser ? 2.5 : 0}
                    opacity={count > 0 ? 0.9 : 0.45}
                  />
                  {(isSel || count > 0) && (
                    <text
                      y={-(r + 6)}
                      textAnchor="middle"
                      fontSize="10"
                      fill={C.text}
                      fontFamily={bodyFont}
                    >
                      {g.name}{count > 0 ? ` · ${count}` : ""}
                    </text>
                  )}
                </g>
              </g>
            );
          })}
        </g>
      </svg>

      {/* Zoom controls */}
      <div
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}
      >
        {[
          { icon: <Plus size={14} />, action: () => zoomBy(1.5), label: "Zoomer" },
          { icon: <Minus size={14} />, action: () => zoomBy(1 / 1.5), label: "Dézoomer" },
          { icon: <Maximize2 size={13} />, action: resetZoom, label: "Réinitialiser" },
        ].map((btn, i) => (
          <button
            key={i}
            onClick={btn.action}
            aria-label={btn.label}
            style={{
              width: 30,
              height: 30,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: C.bgPanel2,
              border: `1px solid ${C.line}`,
              color: C.text,
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            {btn.icon}
          </button>
        ))}
      </div>
    </div>
  );
}

function App() {
  const [reports, setReports] = useState(null); // null = loading
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null); // gouvernorat id filter
  const [selectedDeleg, setSelectedDeleg] = useState(null); // délégation filter
  const [userGouv, setUserGouv] = useState(null);
  const [locStatus, setLocStatus] = useState("idle"); // idle | locating | done | denied
  const [locAccuracy, setLocAccuracy] = useState(null);
  const [formGouv, setFormGouv] = useState("tunis");
  const [formDeleg, setFormDeleg] = useState(DELEGATIONS["tunis"][0]);
  const [formZone, setFormZone] = useState(LOCATION_OPTIONS.tunis[0].label);
  const [formStreet, setFormStreet] = useState(LOCATION_OPTIONS.tunis[0].streets[0]);
  const [formType, setFormType] = useState("coupure"); // "coupure" | "retabli"
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const pollRef = useRef(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const loadReports = useCallback(async () => {
    // A missing key throws on first-ever run — that's expected, not an error.
    try {
      const res = await window.storage.get("reports", true);
      const arr = res?.value ? JSON.parse(res.value) : [];
      setReports(Array.isArray(arr) ? arr : []);
      setError(null);
    } catch (e) {
      setReports((prev) => prev ?? []);
    }
  }, []);

  useEffect(() => {
    loadReports();
    pollRef.current = setInterval(() => loadReports(), 20000);
    return () => clearInterval(pollRef.current);
  }, [loadReports]);

  const locate = () => {
    try {
      if (typeof navigator === "undefined" || !navigator.geolocation) {
        setLocStatus("denied");
        setLocAccuracy(null);
        return;
      }
      setLocStatus("locating");
      setLocAccuracy(null);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          try {
            const { latitude, longitude, accuracy } = pos.coords;
            let best = null,
              bestD = Infinity;
            for (const g of GOUVERNORATS) {
              const d = haversineSq(latitude, longitude, g.lat, g.lon);
              if (d < bestD) {
                bestD = d;
                best = g;
              }
            }
            const selectedGouv = best?.id ?? "tunis";
            const suggestedZone = pickBestLocationOption(latitude, longitude, selectedGouv);
            setUserGouv(selectedGouv);
            setFormGouv(selectedGouv);
            setFormDeleg(DELEGATIONS[selectedGouv]?.[0] ?? "");
            setFormZone(suggestedZone?.label ?? "");
            setFormStreet(suggestedZone?.streets?.[0] ?? "");
            setLocAccuracy(accuracy ? Math.round(accuracy) : null);
            setLocStatus("done");
          } catch (e) {
            setLocStatus("denied");
            setLocAccuracy(null);
          }
        },
        () => {
          setLocStatus("denied");
          setLocAccuracy(null);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    } catch (e) {
      setLocStatus("denied");
      setLocAccuracy(null);
    }
  };

  const persist = async (next) => {
    setReports(next);
    try {
      await window.storage.set("reports", JSON.stringify(next), true);
    } catch (e) {
      showToast("Échec de l'enregistrement — réessaie.");
    }
  };

  const submitReport = async () => {
    if (submitting) return;
    setSubmitting(true);
    const gouv = GOUVERNORATS.find((g) => g.id === formGouv);
    const isRestored = formType === "retabli";
    const newReport = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      gouvId: formGouv,
      gouvName: gouv?.name ?? formGouv,
      deleg: formDeleg || "",
      zone: formZone || "",
      street: formStreet || "",
      note: note.trim().slice(0, 200),
      createdAt: Date.now(),
      confirms: isRestored ? 0 : 1,
      restored: isRestored ? 1 : 0,
    };
    const next = [newReport, ...(reports ?? [])].slice(0, 300);
    await persist(next);
    setNote("");
    setSubmitting(false);
    showToast(isRestored ? "Merci — signalé comme rétabli !" : "Signalement publié — merci !");
  };

  const vote = async (targetIds, field) => {
    const ids = Array.isArray(targetIds) ? targetIds : [targetIds];
    const next = (reports ?? []).map((r) =>
      ids.includes(r.id) ? { ...r, [field]: (r[field] ?? 0) + 1 } : r
    );
    await persist(next);
  };

  const activeCounts = useMemo(() => {
    const now = Date.now();
    const map = {};
    for (const g of GOUVERNORATS) map[g.id] = 0;
    for (const r of reports ?? []) {
      if (now - r.createdAt <= ACTIVE_WINDOW_MS && r.restored <= r.confirms) {
        map[r.gouvId] = (map[r.gouvId] ?? 0) + 1;
      }
    }
    return map;
  }, [reports]);

  const maxCount = Math.max(1, ...Object.values(activeCounts));

  const visibleReports = useMemo(() => {
    let list = [...(reports ?? [])];
    if (selected) list = list.filter((r) => r.gouvId === selected);
    if (selectedDeleg) list = list.filter((r) => r.deleg === selectedDeleg);

    const grouped = [];
    const map = new Map();
    for (const r of list.sort((a, b) => b.createdAt - a.createdAt)) {
      const key = `${r.gouvId || ""}|${r.deleg || ""}|${r.zone || ""}|${r.street || ""}|${(r.note || "").trim().toLowerCase()}`;
      const existing = map.get(key);
      if (!existing) {
        map.set(key, {
          ...r,
          confirms: Number(r.confirms ?? 0),
          restored: Number(r.restored ?? 0),
          groupIds: [r.id],
        });
      } else {
        existing.confirms += Number(r.confirms ?? 0);
        existing.restored += Number(r.restored ?? 0);
        existing.groupIds.push(r.id);
        existing.createdAt = Math.max(existing.createdAt, r.createdAt);
        if (!existing.note && r.note) existing.note = r.note;
      }
    }

    return Array.from(map.values()).sort((a, b) => b.createdAt - a.createdAt);
  }, [reports, selected, selectedDeleg]);

  const loading = reports === null;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: `radial-gradient(ellipse at top, ${C.bgPanel} 0%, ${C.bg} 55%)`,
        color: C.text,
        fontFamily: bodyFont,
      }}
    >
      <style>{`
        @keyframes pulseDot {
          0% { transform: scale(0.85); opacity: 0.55; }
          50% { transform: scale(1.35); opacity: 0.12; }
          100% { transform: scale(0.85); opacity: 0.55; }
        }
        @keyframes flicker {
          0%, 19%, 21%, 23%, 54%, 56%, 100% { opacity: 1; }
          20%, 22%, 55% { opacity: 0.35; }
        }
        .signal-ring { animation: pulseDot 2.2s ease-in-out infinite; transform-origin: center; }
        .brand-flicker { animation: flicker 6s linear infinite; }
        .map-svg { cursor: grab; }
        .map-svg:active { cursor: grabbing; }
        select, button, textarea { font-family: inherit; }
        ::selection { background: ${C.amber}55; }
      `}</style>

      {/* Header */}
      <header
        style={{
          borderBottom: `1px solid ${C.line}`,
          padding: "22px 20px 18px",
          maxWidth: 960,
          margin: "0 auto",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Zap size={22} color={C.amber} className="brand-flicker" fill={C.amber} />
          <h1
            style={{
              fontFamily: displayFont,
              fontSize: 26,
              letterSpacing: 0.5,
              margin: 0,
              fontWeight: 700,
            }}
          >
            Dhawmap Live
          </h1>
          <span
            style={{
              marginLeft: "auto",
              fontSize: 11,
              color: C.textDim,
              border: `1px solid ${C.line}`,
              borderRadius: 999,
              padding: "4px 10px",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Radio size={12} color={C.teal} />
            {loading ? "connexion…" : `${(reports ?? []).length} signalements`}
          </span>
        </div>
        <p style={{ color: C.textDim, fontSize: 14, marginTop: 8, maxWidth: 560, lineHeight: 1.5 }}>
          La carte collaborative des coupures d'électricité en Tunisie. Signale ta zone,
          confirme ou infirme les autres signalements — en temps réel, par la communauté.
        </p>
      </header>

      <main style={{ maxWidth: 960, margin: "0 auto", padding: "24px 20px 60px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 24 }} className="md-grid">
          {/* Map + form column */}
          <div>
            {/* Map */}
            <div
              style={{
                background: C.bgPanel,
                border: `1px solid ${C.line}`,
                borderRadius: 16,
                padding: 12,
                position: "relative",
              }}
            >
              <TunisiaMap
                gouvernorats={GOUVERNORATS}
                activeCounts={activeCounts}
                maxCount={maxCount}
                selected={selected}
                onSelect={(gid) => {
                  setSelected(gid);
                  setSelectedDeleg(null);
                }}
                userGouv={userGouv}
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: 6,
                  fontSize: 11,
                  color: C.textDim,
                  padding: "0 4px",
                }}
              >
                <span>Molette / pincer pour zoomer · glisser pour déplacer</span>
                <button
                  onClick={() => loadReports(false)}
                  style={{
                    background: "none",
                    border: "none",
                    color: C.textDim,
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    cursor: "pointer",
                  }}
                >
                  <RefreshCw size={12} /> actualiser
                </button>
              </div>
            </div>

            {/* Locate + filter */}
            <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
              <button
                onClick={locate}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  background: C.bgPanel2,
                  border: `1px solid ${C.line}`,
                  color: C.text,
                  borderRadius: 10,
                  padding: "8px 12px",
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                <Navigation size={14} color={C.teal} />
                {locStatus === "locating" ? "Localisation…" : userGouv ? `Ma zone : ${GOUVERNORATS.find(g=>g.id===userGouv)?.name}` : "Me localiser"}
              </button>
              {selected && (
                <button
                  onClick={() => {
                    setSelected(null);
                    setSelectedDeleg(null);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    background: "none",
                    border: `1px solid ${C.line}`,
                    color: C.textDim,
                    borderRadius: 10,
                    padding: "8px 12px",
                    fontSize: 13,
                    cursor: "pointer",
                  }}
                >
                  <X size={14} /> Filtre : {GOUVERNORATS.find((g) => g.id === selected)?.name}
                </button>
              )}
              {locStatus === "denied" && (
                <span style={{ fontSize: 12, color: C.textDim, alignSelf: "center" }}>
                  Géolocalisation indisponible dans cet aperçu (bloquée par le navigateur ou refusée) — choisis ta zone manuellement ci-dessous.
                </span>
              )}
              {locStatus === "done" && locAccuracy !== null && (
                <span style={{ fontSize: 12, color: C.teal, alignSelf: "center" }}>
                  GPS précis activé · précision ≈ ±{locAccuracy} m
                </span>
              )}
            </div>

            {/* Report form */}
            <div
              style={{
                background: C.bgPanel,
                border: `1px solid ${C.line}`,
                borderRadius: 16,
                padding: 16,
                marginTop: 16,
              }}
            >
              <h2 style={{ fontFamily: displayFont, fontSize: 16, margin: "0 0 10px", display: "flex", alignItems: "center", gap: 8 }}>
                <AlertTriangle size={16} color={C.amber} /> Signaler une coupure
              </h2>
              <label style={{ fontSize: 12, color: C.textDim }}>Gouvernorat</label>
              <select
                value={formGouv}
                onChange={(e) => {
                  const gid = e.target.value;
                  const nextOptions = LOCATION_OPTIONS[gid] ?? LOCATION_OPTIONS.default;
                  const nextZone = nextOptions[0];
                  setFormGouv(gid);
                  setFormDeleg(DELEGATIONS[gid]?.[0] ?? "");
                  setFormZone(nextZone?.label ?? "");
                  setFormStreet(nextZone?.streets?.[0] ?? "");
                }}
                style={{
                  width: "100%",
                  background: C.bg,
                  border: `1px solid ${C.line}`,
                  color: C.text,
                  borderRadius: 8,
                  padding: "9px 10px",
                  marginTop: 4,
                  marginBottom: 10,
                  fontSize: 14,
                }}
              >
                {GOUVERNORATS.map((g) => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
              <label style={{ fontSize: 12, color: C.textDim }}>Délégation / secteur</label>
              <select
                value={formDeleg}
                onChange={(e) => setFormDeleg(e.target.value)}
                style={{
                  width: "100%",
                  background: C.bg,
                  border: `1px solid ${C.line}`,
                  color: C.text,
                  borderRadius: 8,
                  padding: "9px 10px",
                  marginTop: 4,
                  marginBottom: 10,
                  fontSize: 14,
                }}
              >
                {(DELEGATIONS[formGouv] ?? []).map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              <label style={{ fontSize: 12, color: C.textDim }}>Zone / quartier</label>
              <select
                value={formZone}
                onChange={(e) => {
                  const chosen = (LOCATION_OPTIONS[formGouv] ?? LOCATION_OPTIONS.default).find((opt) => opt.label === e.target.value);
                  setFormZone(e.target.value);
                  setFormStreet(chosen?.streets?.[0] ?? "");
                }}
                style={{
                  width: "100%",
                  background: C.bg,
                  border: `1px solid ${C.line}`,
                  color: C.text,
                  borderRadius: 8,
                  padding: "9px 10px",
                  marginTop: 4,
                  marginBottom: 10,
                  fontSize: 14,
                }}
              >
                {((LOCATION_OPTIONS[formGouv] ?? LOCATION_OPTIONS.default)).map((opt) => (
                  <option key={opt.label} value={opt.label}>{opt.label}</option>
                ))}
              </select>
              <label style={{ fontSize: 12, color: C.textDim }}>Rue / avenue</label>
              <select
                value={formStreet}
                onChange={(e) => setFormStreet(e.target.value)}
                style={{
                  width: "100%",
                  background: C.bg,
                  border: `1px solid ${C.line}`,
                  color: C.text,
                  borderRadius: 8,
                  padding: "9px 10px",
                  marginTop: 4,
                  marginBottom: 10,
                  fontSize: 14,
                }}
              >
                {(((LOCATION_OPTIONS[formGouv] ?? LOCATION_OPTIONS.default).find((opt) => opt.label === formZone) ?? LOCATION_OPTIONS[formGouv]?.[0] ?? LOCATION_OPTIONS.default[0])?.streets ?? []).map((street) => (
                  <option key={street} value={street}>{street}</option>
                ))}
              </select>
              <label style={{ fontSize: 12, color: C.textDim }}>Précision (quartier, depuis quand…) — optionnel</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={200}
                rows={2}
                placeholder="Ex : coupure depuis 18h à El Menzah 6"
                style={{
                  width: "100%",
                  background: C.bg,
                  border: `1px solid ${C.line}`,
                  color: C.text,
                  borderRadius: 8,
                  padding: "9px 10px",
                  marginTop: 4,
                  marginBottom: 12,
                  fontSize: 14,
                  resize: "vertical",
                }}
              />
              <label style={{ fontSize: 12, color: C.textDim }}>État de l'électricité</label>
              <div style={{ display: "flex", gap: 8, marginTop: 4, marginBottom: 14 }}>
                <button
                  type="button"
                  onClick={() => setFormType("coupure")}
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    background: formType === "coupure" ? `${C.amber}22` : C.bg,
                    border: `1.5px solid ${formType === "coupure" ? C.amber : C.line}`,
                    color: formType === "coupure" ? C.amber : C.textDim,
                    borderRadius: 8,
                    padding: "9px 8px",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  <Zap size={14} /> Ça marche pas
                </button>
                <button
                  type="button"
                  onClick={() => setFormType("retabli")}
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    background: formType === "retabli" ? `${C.teal}22` : C.bg,
                    border: `1.5px solid ${formType === "retabli" ? C.teal : C.line}`,
                    color: formType === "retabli" ? C.teal : C.textDim,
                    borderRadius: 8,
                    padding: "9px 8px",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  <CheckCircle2 size={14} /> Ça marche
                </button>
              </div>
              <button
                onClick={submitReport}
                disabled={submitting}
                style={{
                  width: "100%",
                  background: formType === "retabli" ? C.teal : C.amber,
                  color: "#1B1503",
                  border: "none",
                  borderRadius: 10,
                  padding: "10px 12px",
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: submitting ? "default" : "pointer",
                  opacity: submitting ? 0.6 : 1,
                }}
              >
                {submitting ? "Publication…" : "Publier le signalement"}
              </button>
              <p style={{ fontSize: 11, color: C.textDim, marginTop: 8 }}>
                Visible par tous les utilisateurs de l'app — reste factuel, sans données personnelles.
              </p>
            </div>
          </div>

          {/* List column */}
          <div>
            <h2 style={{ fontFamily: displayFont, fontSize: 16, margin: "0 0 12px" }}>
              {selected ? `Signalements — ${GOUVERNORATS.find((g) => g.id === selected)?.name}` : "Derniers signalements"}
            </h2>

            {selected && (DELEGATIONS[selected]?.length ?? 0) > 0 && (
              <div
                style={{
                  display: "flex",
                  gap: 6,
                  flexWrap: "wrap",
                  marginBottom: 14,
                }}
              >
                {DELEGATIONS[selected].map((d) => {
                  const isSel = selectedDeleg === d;
                  return (
                    <button
                      key={d}
                      onClick={() => setSelectedDeleg(isSel ? null : d)}
                      style={{
                        background: isSel ? `${C.amber}22` : "none",
                        border: `1px solid ${isSel ? C.amber : C.line}`,
                        color: isSel ? C.amber : C.textDim,
                        borderRadius: 999,
                        padding: "4px 10px",
                        fontSize: 11,
                        cursor: "pointer",
                      }}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>
            )}

            {error && <p style={{ color: C.red, fontSize: 13 }}>{error}</p>}
            {loading && <p style={{ color: C.textDim, fontSize: 13 }}>Chargement…</p>}
            {!loading && visibleReports.length === 0 && (
              <div
                style={{
                  border: `1px dashed ${C.line}`,
                  borderRadius: 12,
                  padding: 24,
                  textAlign: "center",
                  color: C.textDim,
                  fontSize: 13,
                }}
              >
                Aucun signalement {selected ? "pour cette zone" : "pour l'instant"}.
                <br />Sois le premier à informer la communauté.
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {visibleReports.map((r) => {
                const stillOut = r.confirms >= (r.restored ?? 0);
                return (
                  <div
                    key={r.id}
                    style={{
                      background: C.bgPanel,
                      border: `1px solid ${C.line}`,
                      borderRadius: 12,
                      padding: 12,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 600, fontSize: 14 }}>
                        <MapPin size={14} color={stillOut ? C.amber : C.teal} />
                        {r.gouvName}{r.deleg ? ` · ${r.deleg}` : ""}
                      </div>
                      <span style={{ fontSize: 11, color: C.textDim }}>{timeAgo(r.createdAt)}</span>
                    </div>
                    {(r.zone || r.street) && (
                      <p style={{ fontSize: 12, color: C.textDim, margin: "6px 0 0", lineHeight: 1.4 }}>
                        {r.zone}{r.zone && r.street ? " · " : ""}{r.street}
                      </p>
                    )}
                    {r.note && (
                      <p style={{ fontSize: 13, color: C.text, margin: "6px 0", lineHeight: 1.4 }}>{r.note}</p>
                    )}
                    <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                      <button
                        onClick={() => vote(r.groupIds ?? [r.id], "confirms")}
                        style={{
                          flex: 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 6,
                          background: C.bgPanel2,
                          border: `1px solid ${C.amberDim}`,
                          color: C.amber,
                          borderRadius: 8,
                          padding: "7px 8px",
                          fontSize: 12,
                          cursor: "pointer",
                        }}
                      >
                        <Zap size={13} /> Toujours coupé · {r.confirms}
                      </button>
                      <button
                        onClick={() => vote(r.groupIds ?? [r.id], "restored")}
                        style={{
                          flex: 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 6,
                          background: C.bgPanel2,
                          border: `1px solid ${C.line}`,
                          color: C.teal,
                          borderRadius: 8,
                          padding: "7px 8px",
                          fontSize: 12,
                          cursor: "pointer",
                        }}
                      >
                        <CheckCircle2 size={13} /> Rétabli · {r.restored ?? 0}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 20,
            left: "50%",
            transform: "translateX(-50%)",
            background: C.bgPanel2,
            border: `1px solid ${C.amber}`,
            color: C.text,
            padding: "10px 16px",
            borderRadius: 999,
            fontSize: 13,
            boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
          }}
        >
          {toast}
        </div>
      )}

      <div style={{marginTop:20,padding:'16px 18px',border:'1px solid #2C3560',borderRadius:16,background:'rgba(22,27,52,0.75)',color:'#D9DCEB',fontSize:13,lineHeight:1.6}}>
        <div style={{fontFamily:"'Trebuchet MS', 'Century Gothic', ui-sans-serif, sans-serif",color:'#F2C94C',fontSize:14,fontWeight:700,marginBottom:6}}>Comment ça marche</div>
        <div style={{marginBottom:8}}>
          • Choisis ta zone ou ta rue dans la liste, puis publie un signalement pour indiquer si l’électricité est coupée ou rétablie.
        </div>
        <div style={{marginBottom:8}}>
          • Les signalements récents comptent davantage et le statut évolue en temps réel selon les votes de la communauté.
        </div>
        <div style={{marginBottom:8}}>
          • Ce site est indépendant et <strong>n’est pas officiel</strong> : il n’est pas géré par le gouvernement tunisien et ne collecte aucune donnée personnelle de ses utilisateurs.
        </div>
        <div>
          • Les informations sont fournies à titre collaboratif pour aider la communauté à mieux suivre la situation locale.
        </div>
      </div>

      <style>{`
        @media (min-width: 800px) {
          main > div { grid-template-columns: 1.1fr 0.9fr !important; align-items: start; }
        }
      `}</style>
    </div>
  );
}

function AdPopup({visible,onClose}){
  if(!visible) return null;
  return (
    <div className="ad-popup-backdrop" role="dialog" aria-modal="true">
      <div className="ad-popup">
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer la popup"
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            border: "none",
            background: "transparent",
            color: "#111",
            fontSize: 22,
            cursor: "pointer",
            lineHeight: 1,
          }}
        >
          ×
        </button>
        <h3>Découvrir notre partenaire</h3>
        <p>Annonce non intrusive — merci de soutenir le projet. Cliquez pour en savoir plus.</p>
        <p style={{fontSize:12,color:'#555',marginTop:10}}>Pour publier une publicité, merci de me contacter sur <a href="https://www.facebook.com/khalil.elkamel.31/" target="_blank" rel="noopener noreferrer">Facebook</a> ou <a href="https://www.instagram.com/khalil_el_kamel" target="_blank" rel="noopener noreferrer">Instagram</a>.</p>
        <div className="ad-actions">
          <button className="ad-close" onClick={onClose}>Fermer</button>
          <a className="ad-cta" href="https://example.com" target="_blank" rel="noopener noreferrer">Voir l'offre</a>
        </div>
      </div>
    </div>
  );
}

function SmallAd({visible,onClose}){
  if(!visible) return null;
  return (
    <div className="ad-mini" role="complementary" aria-label="Annonce">
      <div style={{display:'flex',width:'100%',justifyContent:'space-between',alignItems:'center'}}>
        <strong style={{fontSize:13}}>Sponsor</strong>
        <button onClick={onClose} className="ad-close" aria-label="Fermer annonce">×</button>
      </div>
      <div style={{fontSize:13,color:'#333'}}>Offre spéciale — En savoir plus</div>
      <a href="https://example.com" target="_blank" rel="noopener noreferrer" className="ad-cta" style={{alignSelf:'flex-end'}}>Voir</a>
    </div>
  );
}

export default function DhawmapLive() {
  const forceAds = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('show_ads') === '1';
  const [adPopupVisible,setAdPopupVisible] = React.useState(forceAds);
  const [adMiniVisible,setAdMiniVisible] = React.useState(forceAds);

  React.useEffect(()=>{
    if(forceAds){
      setAdPopupVisible(true);
      setAdMiniVisible(true);
      return;
    }
    try{
      const popupClosed = localStorage.getItem('dhaw_ad_popup_closed');
      if(!popupClosed){
        const t = setTimeout(()=>{
          setAdPopupVisible(true);
        },3000);
        return ()=>clearTimeout(t);
      }
    }catch(e){}
  },[forceAds]);

  React.useEffect(()=>{
    if(forceAds) return;
    try{
      const miniClosed = localStorage.getItem('dhaw_ad_mini_closed');
      if(miniClosed) return;
      const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
      if(isMobile) setAdMiniVisible(true);
    }catch(e){}
  },[forceAds]);

  const handleClosePopup = ()=>{
    setAdPopupVisible(false);
    try{localStorage.setItem('dhaw_ad_popup_closed','1')}catch(e){}
  };
  const handleCloseMini = ()=>{
    setAdMiniVisible(false);
    try{localStorage.setItem('dhaw_ad_mini_closed','1')}catch(e){}
  };

  return (
    <ErrorBoundary>
      <App />
      <AdPopup visible={adPopupVisible} onClose={handleClosePopup} />
      <SmallAd visible={adMiniVisible} onClose={handleCloseMini} />
      <footer style={{padding:'20px 16px 28px',textAlign:'center',color:'#9AA0C0',fontSize:13,borderTop:'1px solid #2C3560',marginTop:24,background:'rgba(22,27,52,0.7)',borderRadius:'16px 16px 0 0'}}>
        <div style={{fontFamily:"'Trebuchet MS', 'Century Gothic', ui-sans-serif, sans-serif",color:'#F2F1EA',fontSize:14}}>© 2026 Dhawmap Live — Créé par Khalil El Kamel</div>
        <div style={{marginTop:8,display:'flex',justifyContent:'center',gap:10,flexWrap:'wrap'}}>
          <a href="https://www.facebook.com/khalil.elkamel.31/" target="_blank" rel="noopener noreferrer" style={{color:'#F2C94C',textDecoration:'none',border:'1px solid #2C3560',padding:'6px 10px',borderRadius:'999px',background:'#1D2444'}}>Facebook</a>
          <a href="https://www.instagram.com/khalil_el_kamel" target="_blank" rel="noopener noreferrer" style={{color:'#4ECDC4',textDecoration:'none',border:'1px solid #2C3560',padding:'6px 10px',borderRadius:'999px',background:'#1D2444'}}>Instagram</a>
        </div>
      </footer>
    </ErrorBoundary>
  );
}
