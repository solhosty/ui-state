export const dashboardStyles = `
:root {
  font-family:
    Inter,
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    sans-serif;
  color: #242725;
  background: #f8f9f8;
  font-synthesis: none;
  --line: #e3e6e3;
  --muted: #737a75;
  --accent: #d85b35;
  --ink: #242725;
}
* {
  box-sizing: border-box;
}
body {
  margin: 0;
}
button,
input,
select {
  font: inherit;
}
button,
a,
input,
select,
summary {
  -webkit-tap-highlight-color: transparent;
}
button {
  cursor: pointer;
}
button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
button:focus-visible,
a:focus-visible,
summary:focus-visible,
select:focus-visible {
  outline: 3px solid #e8a08a;
  outline-offset: 3px;
}
button {
  transition:
    background 0.15s,
    border-color 0.15s,
    transform 0.15s;
}
[hidden] {
  display: none !important;
}
.app {
  display: grid;
  grid-template-columns: 212px minmax(0, 1fr);
  grid-template-rows: 64px minmax(calc(100vh - 64px), auto);
}
.topbar {
  grid-column: 1/-1;
  border-bottom: 1px solid var(--line);
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 26px;
  gap: 20px;
}
.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  font-weight: 650;
  letter-spacing: -0.3px;
  color: inherit;
  text-decoration: none;
}
.brand-mark {
  display: grid;
  place-items: center;
  background: var(--ink);
  color: #fff;
  width: 29px;
  height: 29px;
  border-radius: 8px;
  font-size: 22px;
  font-weight: 400;
}
.local-tag {
  font-size: 9px;
  letter-spacing: 1px;
  color: #828983;
  border: 1px solid var(--line);
  padding: 4px 5px;
  border-radius: 4px;
  margin-left: 2px;
}
.connection {
  font-size: 11px;
  color: var(--muted);
  display: flex;
  align-items: center;
  gap: 7px;
}
.connection:before,
.local-dot {
  content: '';
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #558769;
}
.connection[data-status='error']:before {
  background: var(--accent);
}
.sidebar {
  position: relative;
  background: #f1f3f1;
  border-right: 1px solid var(--line);
  padding: 28px 14px 140px;
  min-width: 0;
}
.sidebar-heading {
  display: flex;
  justify-content: space-between;
  padding: 0 10px;
  font-size: 9px;
  letter-spacing: 1.3px;
  color: #828982;
}
.tiny-label {
  letter-spacing: 0;
}
.workspace-name {
  display: flex;
  align-items: center;
  gap: 9px;
  margin: 21px 7px 35px;
  min-width: 0;
}
.workspace-icon {
  display: grid;
  place-items: center;
  width: 31px;
  height: 31px;
  flex: none;
  background: #e6e9e5;
  border: 1px solid #dce1db;
  border-radius: 7px;
  font-size: 21px;
  color: #596657;
}
.workspace-name > div {
  min-width: 0;
}
.workspace-name strong {
  display: block;
  font-size: 12px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.workspace-name div > span {
  display: block;
  font-size: 10px;
  color: var(--muted);
  margin-top: 5px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.section-label {
  padding: 0 10px;
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #6f7770;
  margin-bottom: 12px;
}
.section-label > span {
  font-size: 10px;
}
.route {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 6px;
  padding: 11px 10px;
  text-align: left;
  margin: 3px 0;
  color: #687169;
}
.route:hover {
  background: #e8ece7;
}
.route[aria-current='page'] {
  background: #fff;
  color: #252d26;
  border-color: #dfe4dd;
  box-shadow: 0 1px 2px #19221905;
}
.route-symbol {
  color: #889184;
  font-size: 14px;
}
.route-name {
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}
.route-count {
  font-size: 10px;
  color: #8b938b;
}
.sidebar-bottom {
  position: absolute;
  bottom: 24px;
  left: 24px;
  right: 24px;
  font-size: 10px;
  color: #657264;
}
.sidebar-bottom .local-dot {
  margin-right: 5px;
  width: 5px;
  height: 5px;
}
.sidebar-bottom p {
  font-size: 10px;
  color: #8a9288;
  line-height: 1.65;
  margin: 8px 0 0;
}
main {
  padding: 24px 32px 0;
  min-width: 0;
  max-width: 1800px;
  width: 100%;
  margin: 0 auto;
}
.commandbar {
  display: flex;
  gap: 8px;
  align-items: flex-end;
}
.commandbar form {
  flex: 1;
  min-width: 0;
}
.url-label {
  display: none;
}
.url-control {
  display: flex;
  align-items: center;
  border: 1px solid #dce1da;
  border-radius: 8px;
  background: #fff;
  padding: 4px 4px 4px 13px;
  gap: 10px;
  box-shadow: 0 1px 3px #1d241c04;
}
.url-control > span {
  color: #7a8577;
  font-size: 16px;
}
.url-control:focus-within {
  border-color: #94a28d;
  box-shadow: 0 0 0 3px #e8ede5;
}
.url-control input {
  border: 0;
  outline: 0;
  min-width: 0;
  flex: 1;
  color: #4e584e;
  background: transparent;
  font-size: 12px;
  height: 30px;
}
.primary,
.secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  border: 1px solid transparent;
  padding: 10px 15px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
}
.primary {
  color: #fff;
  background: #292e29;
  border-color: #292e29;
}
.primary:hover {
  background: #414b3f;
}
.primary span {
  color: #cbd2c7;
}
.secondary {
  color: #5f6b5e;
  background: #fff;
  border-color: #dde3da;
}
.secondary:hover {
  background: #edf1ea;
  border-color: #bbc6b6;
}
.settings-button {
  height: 40px;
}
.activity {
  font-size: 11px;
  line-height: 1.5;
  color: #697565;
  margin-top: 8px;
  min-height: 17px;
  overflow-wrap: anywhere;
}
.activity[data-status='error'] {
  color: #a04d35;
}
.page-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin: 15px 0 22px;
}
.eyebrow {
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 1.5px;
  color: #8a9286;
}
.page-heading h1 {
  font-size: 26px;
  font-weight: 550;
  letter-spacing: -1px;
  margin: 8px 0 8px;
  overflow-wrap: anywhere;
}
.page-heading p {
  font-size: 12px;
  color: var(--muted);
  margin: 0;
  line-height: 1.6;
}
.history-control {
  display: flex;
  flex-direction: column;
  gap: 7px;
  max-width: 260px;
  min-width: 155px;
  font-size: 10px;
  color: #858d80;
}
.history-control select {
  background: transparent;
  border: 0;
  border-bottom: 1px solid #dce2d8;
  padding: 5px 20px 7px 0;
  color: #52604d;
  font-size: 11px;
  width: 100%;
  text-overflow: ellipsis;
  cursor: pointer;
}
.board-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  border-bottom: 1px solid var(--line);
  padding-bottom: 14px;
  margin-bottom: 22px;
}
.board-title {
  display: flex;
  gap: 9px;
  align-items: center;
}
.board-icon {
  color: #818c7c;
  font-size: 19px;
}
.board-title h2 {
  font-size: 12px;
  font-weight: 600;
  margin: 0;
}
.count {
  background: #e9ede6;
  color: #6f7c66;
  border-radius: 5px;
  min-width: 20px;
  padding: 3px 5px;
  text-align: center;
  font-size: 10px;
}
.segmented {
  display: flex;
  padding: 3px;
  border: 1px solid #e1e5de;
  border-radius: 7px;
  background: #eef1ec;
  gap: 2px;
}
.segmented button {
  background: transparent;
  border: 1px solid transparent;
  padding: 6px 10px;
  font-size: 10px;
  color: #7c8576;
  border-radius: 4px;
}
.segmented button[aria-pressed='true'] {
  background: #fff;
  border-color: #e0e5dc;
  color: #384333;
  box-shadow: 0 1px 2px #1b241508;
}
.board {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px 22px;
}
.state-card {
  display: block;
  position: relative;
  min-width: 0;
  text-align: left;
  border: 1px solid #dce2d8;
  border-radius: 9px;
  padding: 0;
  background: #fff;
  overflow: hidden;
  color: inherit;
  box-shadow: 0 2px 4px #26311c04;
  animation: appear 0.25s ease-out;
}
.state-card:hover {
  border-color: #9daa92;
  box-shadow: 0 5px 18px #26311c0c;
  transform: translateY(-2px);
}
.card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  border-bottom: 1px solid #edf0ea;
  font-size: 10px;
}
.card-id {
  display: flex;
  gap: 7px;
  align-items: center;
  color: #808a79;
  font-variant-numeric: tabular-nums;
}
.card-id strong {
  color: #424e3b;
  font-weight: 500;
}
.status {
  font-size: 10px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: #6d7c66;
}
.status:before {
  content: '';
  width: 5px;
  height: 5px;
  background: #8e9a87;
  border-radius: 50%;
}
.status.verified {
  color: #55784c;
}
.status.verified:before {
  background: #6d9460;
}
.status.warning {
  color: #a46745;
}
.status.warning:before {
  background: #b8895c;
}
.shot {
  height: 230px;
  display: flex;
  justify-content: center;
  overflow: hidden;
  background: #eef1ec;
  padding: 16px 20px 0;
  border-bottom: 1px solid #e8ede3;
}
.shot img {
  display: block;
  width: 100%;
  height: auto;
  align-self: flex-start;
  border-radius: 4px 4px 0 0;
  border: 1px solid #dce2d5;
  box-shadow: 0 2px 6px #2537190c;
}
.shot.mobile img {
  width: 118px;
}
.shot.tablet img {
  width: 235px;
}
.card-bottom {
  padding: 15px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
.card-bottom h3 {
  font-size: 13px;
  font-weight: 600;
  margin: 0 0 5px;
  letter-spacing: -0.1px;
}
.card-bottom p {
  font-size: 11px;
  color: #85907c;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 310px;
}
.card-bottom > div {
  min-width: 0;
}
.open-arrow {
  font-size: 18px;
  color: #a3ad9a;
  transition: color 0.15s;
}
.state-card:hover .open-arrow {
  color: var(--accent);
}
.unavailable {
  margin-top: 24px;
  border: 1px dashed #d9dfd3;
  border-radius: 7px;
  padding: 14px 16px;
  background: #f4f6f1;
}
.unavailable-heading {
  font-size: 11px;
  color: #6b775f;
  font-weight: 600;
  margin: 0 0 8px;
}
.unavailable-item {
  font-size: 11px;
  color: #8a937f;
  line-height: 1.6;
}
.unavailable-item button {
  border: 0;
  background: none;
  font-size: 11px;
  font-weight: 600;
  color: #6f7b63;
  padding: 0;
  margin-right: 8px;
  text-decoration: underline;
  text-underline-offset: 3px;
}
.empty {
  grid-column: 1/-1;
  padding: 65px 25px;
  text-align: center;
  border: 1px dashed #d8e0d1;
  border-radius: 10px;
  color: #7c8972;
}
.empty-mark {
  font-size: 34px;
  color: #98a68c;
}
.empty h2 {
  font-size: 18px;
  font-weight: 500;
  color: #54624b;
  letter-spacing: -0.3px;
}
.empty p {
  max-width: 380px;
  margin: 0 auto;
  line-height: 1.8;
  font-size: 12px;
}
footer {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  padding: 25px 0;
  font-size: 10px;
  color: #959e8d;
}
dialog {
  color: var(--ink);
  border: 1px solid #d4dccd;
  padding: 0;
  background: #fff;
  box-shadow: 0 30px 100px #14220f33;
}
dialog::backdrop {
  background: #18241477;
  backdrop-filter: blur(5px);
}
.inspector {
  width: calc(100vw - 64px);
  max-width: 1500px;
  border-radius: 12px;
  max-height: calc(100vh - 48px);
}
.inspector-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 24px;
  border-bottom: 1px solid var(--line);
}
.inspector-heading h2 {
  font-size: 18px;
  letter-spacing: -0.5px;
  font-weight: 600;
  margin: 6px 0 0;
}
.inspector-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}
.inspector-actions .secondary {
  padding: 8px 11px;
}
.close {
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
  font-size: 24px;
  font-weight: 300;
  background: transparent;
  border: 0;
  border-radius: 5px;
  color: #7c8873;
  cursor: pointer;
}
.close:hover {
  background: #eef2e9;
}
.inspector-actions .close {
  margin-left: 12px;
}
.inspector-body {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 265px;
  min-height: 350px;
}
.inspect-canvas {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  background: #edf1e8;
  padding: 24px;
  overflow: auto;
  max-height: calc(100vh - 220px);
  min-height: 400px;
}
.inspect-canvas img {
  display: block;
  width: 100%;
  height: auto;
  border: 1px solid #d8e0cf;
  border-radius: 5px;
  box-shadow: 0 4px 20px #2338160d;
}
.inspect-canvas img.mobile {
  max-width: 360px;
}
.inspect-canvas img.tablet {
  max-width: 768px;
}
.evidence {
  padding: 24px;
  border-left: 1px solid var(--line);
  font-size: 11px;
  overflow: auto;
  max-height: calc(100vh - 220px);
}
#inspect-condition {
  line-height: 1.7;
  color: #626f59;
  margin: 10px 0 20px;
}
.evidence-status {
  padding: 12px;
  background: #f0f5eb;
  border: 1px solid #e0e8d7;
  border-radius: 6px;
  color: #658453;
  font-size: 11px;
  line-height: 1.6;
}
.evidence-status.warning {
  color: #9b694b;
  background: #faf4ed;
  border-color: #eee2d4;
}
.evidence dl {
  margin: 20px 0;
}
.evidence dl > div {
  padding: 11px 0;
  border-bottom: 1px solid #edf0e8;
}
.evidence dt {
  font-size: 9px;
  color: #959e8b;
  text-transform: uppercase;
  letter-spacing: 0.7px;
}
.evidence dd {
  margin: 6px 0 0;
  color: #5c6b50;
  line-height: 1.6;
  overflow-wrap: anywhere;
}
.evidence .primary {
  width: 100%;
}
.help {
  font-size: 11px;
  color: #859077;
  line-height: 1.7;
}
.evidence .help {
  font-size: 10px;
}
.feedback {
  font-size: 11px;
  color: #5e7c4e;
  line-height: 1.6;
  overflow-wrap: anywhere;
}
.feedback[data-status='error'] {
  color: #a25134;
}
.evidence details {
  border-top: 1px solid var(--line);
  padding-top: 15px;
  margin-top: 20px;
  color: #8b957e;
  font-size: 10px;
}
summary {
  cursor: pointer;
}
code {
  display: block;
  font-size: 9px;
  line-height: 1.7;
  overflow-wrap: anywhere;
  margin-top: 10px;
}
.inspector-footer {
  display: flex;
  justify-content: space-between;
  padding: 12px 24px;
  border-top: 1px solid var(--line);
  font-size: 10px;
  color: #8a957d;
}
.settings-modal {
  border-radius: 12px;
  width: min(460px, calc(100vw - 32px));
  padding: 26px;
}
.modal-heading {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}
.modal-heading h2 {
  margin: 7px 0 0;
  font-size: 21px;
  letter-spacing: -0.5px;
  font-weight: 550;
}
.settings-modal label {
  display: grid;
  font-size: 12px;
  color: #4c5d40;
  gap: 7px;
  margin-top: 24px;
}
.settings-modal label span {
  font-size: 10px;
  color: #8b987e;
}
.settings-modal input {
  margin-top: 4px;
  border: 1px solid #d5decf;
  border-radius: 6px;
  padding: 11px;
  background: #fff;
  color: #465739;
  font-size: 12px;
  width: 100%;
}
.settings-modal input:focus {
  outline: 2px solid #aebda3;
  outline-offset: 1px;
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 28px;
}
#source-routes {
  margin: 24px 10px;
  font-size: 10px;
  color: #839076;
  line-height: 1.8;
}
.source-item {
  margin: 10px 0;
  overflow-wrap: anywhere;
}
.source-item strong {
  display: block;
  color: #667559;
}
@keyframes appear {
  from {
    opacity: 0;
    transform: translateY(5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
@media (min-width: 1500px) {
  .shot {
    height: 300px;
  }
}
@media (max-width: 1000px) {
  .app {
    grid-template-columns: 180px minmax(0, 1fr);
  }
  main {
    padding: 22px 22px 0;
  }
  .sidebar {
    padding-left: 8px;
    padding-right: 8px;
  }
  .shot {
    height: 185px;
    padding: 12px 12px 0;
  }
  .history-control {
    max-width: 190px;
  }
  .segmented button {
    padding: 6px 7px;
  }
  .inspector-body {
    grid-template-columns: minmax(0, 1fr) 230px;
  }
  .evidence {
    padding: 18px;
  }
}
@media (max-width: 720px) {
  .app {
    grid-template-columns: 1fr;
    grid-template-rows: 56px auto auto;
  }
  .topbar {
    padding: 0 16px;
  }
  .sidebar {
    border-right: 0;
    border-bottom: 1px solid var(--line);
    padding: 10px 16px;
  }
  .sidebar-heading,
  .workspace-name,
  .section-label,
  .sidebar-bottom {
    display: none;
  }
  #routes {
    display: flex;
    overflow: auto;
    gap: 5px;
  }
  .route {
    width: auto;
    min-width: 110px;
    max-width: 230px;
    flex: none;
  }
  .route-name {
    max-width: 160px;
  }
  main {
    padding: 16px;
  }
  .commandbar {
    flex-wrap: wrap;
  }
  .settings-button {
    padding: 10px;
  }
  .page-heading {
    margin: 20px 0;
  }
  .page-heading h1 {
    font-size: 22px;
  }
  .history-control {
    min-width: 120px;
    max-width: 145px;
  }
  .board-toolbar {
    flex-wrap: wrap;
    margin-bottom: 16px;
  }
  .board {
    gap: 15px;
    grid-template-columns: 1fr;
  }
  .shot {
    height: 260px;
  }
  .inspector {
    width: calc(100vw - 20px);
    max-height: calc(100vh - 20px);
  }
  .inspector-heading {
    padding: 14px;
  }
  .inspector-body {
    display: block;
  }
  .inspect-canvas {
    max-height: 45vh;
    min-height: 200px;
    padding: 16px;
  }
  .evidence {
    max-height: none;
    border-left: 0;
    border-top: 1px solid var(--line);
  }
  .inspector-footer {
    padding: 12px 16px;
  }
  .inspector-footer span:last-child {
    display: none;
  }
  footer span:last-child {
    display: none;
  }
  .local-tag {
    display: none;
  }
  .connection {
    font-size: 10px;
  }
  .segmented {
    width: 100%;
    justify-content: space-between;
  }
  .segmented button {
    flex: 1;
  }
  .card-bottom p {
    max-width: 100%;
  }
}
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation: none !important;
    transition: none !important;
  }
}

svg {
  width: 18px;
  height: 18px;
  flex: none;
  vertical-align: middle;
}
.brand-mark svg {
  width: 22px;
  height: 22px;
}
.icon-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  padding: 0;
  flex: none;
  border: 1px solid #dde3da;
  border-radius: 7px;
  background: #fff;
  color: #687262;
}
.icon-button:hover {
  background: #edf1e9;
}
.stop-button {
  color: #ac553b;
  border-color: #e4cec4;
}
.workspace-name {
  width: 100%;
  border: 0;
  background: transparent;
  padding: 8px 4px;
  margin: 15px 0 25px;
  text-align: left;
  cursor: pointer;
  border-radius: 7px;
}
.workspace-name:hover {
  background: #e7ebe5;
}
.workspace-text {
  display: block;
  min-width: 0;
  flex: 1;
}
.workspace-text > span {
  display: block;
  font-size: 10px;
  color: #7f8977;
  margin-top: 5px;
  overflow: hidden;
  text-overflow: ellipsis;
}
.workspace-icon svg {
  width: 19px;
  height: 19px;
}
.workspace-name > svg {
  width: 13px;
  height: 13px;
}
.workspace-option {
  display: block;
  width: 100%;
  padding: 15px;
  text-align: left;
  border: 1px solid #e0e5da;
  background: #fff;
  border-radius: 7px;
  margin: 9px 0;
  color: #47533d;
}
.workspace-option:hover,
.workspace-option[aria-current] {
  border-color: #9cad8d;
  background: #f3f6ef;
}
.workspace-option strong {
  display: block;
  font-size: 12px;
}
.workspace-option span {
  display: block;
  font-size: 11px;
  color: #89937e;
  margin-top: 6px;
}
.board-controls {
  display: flex;
  gap: 12px;
  align-items: center;
}
.view-modes {
  display: flex;
  gap: 3px;
}
.view-modes .icon-button {
  width: 31px;
  height: 31px;
  border-color: transparent;
  background: transparent;
}
.view-modes .icon-button[aria-pressed='true'] {
  background: #e7ecdf;
  border-color: #d7e0cc;
  color: #455839;
}
.view-modes svg {
  width: 16px;
  height: 16px;
}
.progress-panel {
  margin-top: 18px;
  padding: 16px 18px;
  border: 1px solid #dbe3d3;
  background: #f1f5eb;
  border-radius: 8px;
}
.progress-top,
.progress-bottom {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  font-size: 11px;
  color: #7d8b6e;
}
.progress-top strong {
  font-size: 12px;
  color: #4d623b;
}
.progress-track {
  height: 4px;
  border-radius: 4px;
  background: #dfe7d7;
  overflow: hidden;
  margin: 13px 0;
}
.progress-track > div {
  height: 100%;
  background: #789464;
  transition: width 0.4s;
  border-radius: 4px;
}
.progress-bottom span:first-child {
  overflow-wrap: anywhere;
}
.progress-bottom span:last-child {
  white-space: nowrap;
}
.progress-steps {
  display: flex;
  gap: 24px;
  list-style: none;
  padding: 0;
  margin: 15px 0 0;
  font-size: 10px;
  color: #97a28a;
}
.progress-steps li.active {
  color: #506e3b;
  font-weight: 600;
}
.progress-steps li:before {
  content: ' ';
  width: 5px;
  height: 5px;
  border-radius: 50%;
  display: inline-block;
  background: currentColor;
  margin-right: 6px;
}
.indeterminate {
  animation: pulse 1.5s infinite !important;
}
@keyframes pulse {
  50% {
    opacity: 0.35;
  }
}
.map-board {
  position: relative;
  display: block;
  height: var(--map-height, 700px);
  overflow: auto;
  background-color: #eff2ec;
  background-image: radial-gradient(#cfd8c6 0.65px, transparent 0.65px);
  background-size: 16px 16px;
  border: 1px solid #dfe5d8;
  border-radius: 9px;
  padding: 16px 12px;
}
.map-stage {
  position: relative;
  transform-origin: top left;
}
.map-stage .state-card {
  position: absolute;
  width: 312px;
  height: 240px;
  z-index: 1;
}
.map-stage .shot {
  height: 142px;
  padding: 10px 12px 0;
}
.map-stage .card-top {
  padding: 9px 12px;
}
.map-stage .card-bottom {
  padding: 11px 12px;
}
.map-stage .card-bottom p {
  font-size: 10px;
  max-width: 260px;
}
.map-stage .shot.mobile img {
  width: 70px;
}
.map-stage .shot.tablet img {
  width: 140px;
}
.map-edges {
  position: absolute;
  inset: 0;
  overflow: visible;
}
.map-edges path {
  fill: none;
  stroke: #a8b69a;
  stroke-width: 1.5;
}
.map-edges text {
  fill: #7a8b6b;
  font-size: 10px;
  font-family: inherit;
  paint-order: stroke;
  stroke: #eff2ec;
  stroke-width: 5px;
  stroke-linejoin: round;
}
.open-arrow svg {
  width: 16px;
  height: 16px;
}
@media (max-width: 720px) {
  .sidebar .workspace-name {
    display: flex;
    margin: 0 0 6px;
    width: 100%;
    max-width: 300px;
  }
  .board-controls {
    width: 100%;
    justify-content: space-between;
  }
  .board-controls .segmented {
    width: auto;
  }
  .progress-steps {
    gap: 12px;
  }
  .progress-bottom {
    flex-direction: column;
    gap: 5px;
  }
  .map-board {
    max-height: 620px;
  }
  .commandbar {
    flex-wrap: nowrap;
  }
  .commandbar .icon-button {
    width: 38px;
  }
  .url-control .primary {
    padding: 9px;
  }
  .url-control {
    gap: 4px;
    padding-left: 8px;
  }
}
.map-focus .topbar,
.map-focus .sidebar,
.map-focus .commandbar,
.map-focus .page-heading,
.map-focus footer,
.map-focus .activity {
  display: none;
}
.map-focus .app {
  display: block;
}
.map-focus main {
  padding: 18px;
  max-width: none;
}
.map-focus .board-toolbar {
  margin-top: 0;
}
.map-focus .progress-panel {
  margin-top: 0;
  margin-bottom: 12px;
}
.map-surface {
  position: relative;
  overflow: hidden;
}
.map-surface .map-stage {
  position: absolute;
  inset: 0;
}

.reveal-launch {
  background: #31533c;
  border-color: #31533c;
}
.reveal-dialog {
  width: calc(100vw - 28px);
  height: calc(100vh - 28px);
  max-width: 1600px;
  max-height: none;
  border-radius: 14px;
  overflow: hidden;
  background: #f4f5f1;
  padding: 0;
}
.reveal-dialog[open] {
  display: flex;
  flex-direction: column;
}
.reveal-top {
  height: 58px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  flex: none;
  border-bottom: 1px solid #dfe4d9;
  background: #fcfdf9;
  gap: 18px;
}
.reveal-wordmark {
  display: flex;
  align-items: center;
  gap: 9px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}
.reveal-wordmark svg {
  width: 22px;
  height: 22px;
}
.reveal-top > #reveal-source {
  font-size: 11px;
  color: #85907c;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.reveal-copy {
  text-align: center;
  padding: 20px 20px 10px;
  flex: none;
  min-height: 127px;
}
.reveal-copy h2 {
  font-size: 29px;
  font-weight: 550;
  letter-spacing: -1px;
  margin: 9px 0;
}
.reveal-copy p {
  font-size: 12px;
  line-height: 1.6;
  color: #7f8b75;
  margin: 0;
}
.reveal-scene {
  position: relative;
  flex: 1;
  min-height: 260px;
  margin: 4px 24px 15px;
}
.reveal-card {
  position: absolute;
  left: var(--x);
  top: var(--y);
  width: var(--w);
  height: var(--h);
  border: 1px solid #d5ddce;
  border-radius: 8px;
  background: #fff;
  display: flex;
  flex-direction: column;
  padding: 0;
  overflow: hidden;
  text-align: left;
  box-shadow: 0 8px 22px #3042210b;
  opacity: 0;
  transform: translateX(-14px) scale(0.95);
  transition:
    left 0.8s cubic-bezier(0.2, 0.8, 0.2, 1),
    top 0.8s cubic-bezier(0.2, 0.8, 0.2, 1),
    width 0.8s cubic-bezier(0.2, 0.8, 0.2, 1),
    height 0.8s cubic-bezier(0.2, 0.8, 0.2, 1),
    opacity 0.65s,
    transform 0.65s,
    box-shadow 0.2s;
  z-index: 2;
  color: #34442b;
  cursor: pointer;
}
.reveal-card:disabled {
  cursor: default;
  opacity: 0;
}
.reveal-card.baseline,
.reveal-card.visible {
  opacity: 1;
  transform: none;
}
.reveal-card:hover:not(:disabled) {
  border-color: #839975;
  box-shadow: 0 10px 30px #30422118;
}
.reveal-card-top {
  height: 28px;
  flex: none;
  padding: 0 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 9px;
  color: #7a896d;
  border-bottom: 1px solid #e7ecdf;
  background: #fff;
}
.reveal-number {
  font-variant-numeric: tabular-nums;
  color: #a0aa95;
}
.reveal-shot {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  background: #f0f3ed;
  padding: 8px 10px 0;
}
.reveal-shot img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top;
  display: block;
  border: 1px solid #e0e5d9;
  border-radius: 3px 3px 0 0;
}
.reveal-card-bottom {
  height: 42px;
  flex: none;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 6px 10px;
  background: #fff;
  border-top: 1px solid #e8ece3;
  gap: 3px;
}
.reveal-card-bottom strong {
  font-size: 11px;
  font-weight: 600;
}
.reveal-card-bottom > span {
  font-size: 8px;
  color: #809071;
}
.reveal-edges {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  overflow: visible;
}
.reveal-edges path {
  fill: none;
  stroke: #9aaa8b;
  stroke-width: 1.5;
  vector-effect: non-scaling-stroke;
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  opacity: 0;
  transition:
    stroke-dashoffset 0.8s ease,
    opacity 0.3s;
}
.reveal-edges path.visible {
  stroke-dashoffset: 0;
  opacity: 1;
}
.intro .reveal-card.baseline {
  left: 18%;
  top: 0;
  width: 64%;
  height: 100%;
  box-shadow: 0 15px 45px #26391e15;
}
.intro .reveal-card.baseline .reveal-shot img,
.state-focused .reveal-card.selected .reveal-shot img {
  object-fit: contain;
  background: #fff;
}
.intro .reveal-card.baseline .reveal-card-top,
.state-focused .reveal-card.selected .reveal-card-top {
  height: 34px;
  font-size: 11px;
}
.intro .reveal-card.baseline .reveal-card-bottom,
.state-focused .reveal-card.selected .reveal-card-bottom {
  height: 42px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}
.reveal-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 12px 24px 16px;
  min-height: 66px;
  flex: none;
  border-top: 1px solid #dfe5d7;
  background: #fbfcf8;
}
.reveal-bottom > #reveal-recorded {
  font-size: 10px;
  color: #919d85;
  line-height: 1.6;
}
.reveal-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
.reveal-actions .primary {
  background: #294a32;
  border-color: #294a32;
  padding: 12px 18px;
  font-size: 12px;
}
.reveal-actions .secondary {
  font-size: 11px;
}
.reveal-dialog .feedback {
  margin: 0;
  background: #fbfcf8;
  text-align: center;
  padding: 0 20px 10px;
  flex: none;
}
.reveal-dialog .feedback:empty {
  display: none;
}
.state-focused .reveal-card:not(.selected) {
  opacity: 0;
  pointer-events: none;
}
.state-focused .reveal-edges {
  opacity: 0;
  transition: opacity 0.25s;
}
.state-focused .reveal-card.selected {
  left: 18%;
  top: 0;
  width: 64%;
  height: 100%;
  z-index: 3;
}
.state-focused .reveal-card.selected .reveal-card-bottom strong {
  font-size: 13px;
}
.state-focused .reveal-card.selected .reveal-card-bottom > span {
  font-size: 10px;
}
@media (max-width: 1050px) {
  .reveal-launch {
    font-size: 10px;
    padding: 9px;
  }
  .board-controls {
    gap: 7px;
  }
  .reveal-copy h2 {
    font-size: 25px;
  }
  .reveal-copy {
    min-height: 118px;
  }
  .reveal-card-bottom strong {
    font-size: 10px;
  }
}
@media (max-width: 700px) {
  .board-controls {
    flex-wrap: wrap;
  }
  .reveal-dialog {
    width: calc(100vw - 12px);
    height: calc(100vh - 12px);
  }
  .reveal-top {
    padding: 0 14px;
  }
  .reveal-wordmark {
    font-size: 11px;
  }
  .reveal-copy {
    padding: 14px 12px;
    min-height: 130px;
  }
  .reveal-copy h2 {
    font-size: 23px;
  }
  .reveal-copy p {
    font-size: 11px;
  }
  .reveal-scene {
    margin: 0 12px 12px;
    overflow: auto;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .reveal-edges {
    display: none;
  }
  .reveal-card {
    position: relative !important;
    left: auto !important;
    top: auto !important;
    width: 100% !important;
    height: 260px !important;
    flex: none;
    display: none;
    transform: none !important;
  }
  .reveal-card.baseline,
  .reveal-card.visible {
    display: flex;
  }
  .intro .reveal-card.baseline,
  .state-focused .reveal-card.selected {
    height: 100% !important;
    min-height: 260px;
  }
  .state-focused .reveal-card:not(.selected) {
    display: none;
  }
  .reveal-bottom {
    padding: 12px;
    flex-wrap: wrap;
    gap: 8px;
  }
  .reveal-actions {
    width: 100%;
    justify-content: flex-end;
    flex-wrap: wrap;
  }
  .reveal-bottom > #reveal-recorded {
    font-size: 9px;
  }
  .reveal-actions .primary {
    padding: 10px 12px;
    font-size: 11px;
  }
}

.reveal-shot img {
  object-position: center;
}
.reveal-scene {
  min-height: 0;
}
.reveal-dialog {
  scrollbar-width: none;
}
.reveal-card[aria-hidden='true'] {
  pointer-events: none;
}
@media (max-height: 650px) and (min-width: 701px) {
  .reveal-top {
    height: 38px;
  }
  .reveal-copy {
    min-height: 76px;
    padding: 8px 12px;
  }
  .reveal-copy h2 {
    font-size: 22px;
    margin: 5px 0;
  }
  .reveal-copy p {
    font-size: 10px;
  }
  .reveal-copy .eyebrow {
    font-size: 8px;
  }
  .reveal-bottom {
    min-height: 48px;
    padding: 8px 16px;
  }
  .reveal-actions .primary {
    padding: 9px 12px;
    font-size: 11px;
  }
  .reveal-scene {
    margin: 3px 18px 10px;
  }
  .reveal-dialog:not(.intro):not(.state-focused) .reveal-scene {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    gap: 10px;
  }
  .reveal-dialog:not(.intro):not(.state-focused) .reveal-card {
    position: relative;
    left: auto;
    top: auto;
    width: 100%;
    height: 100%;
    min-height: 0;
  }
  .reveal-dialog:not(.intro):not(.state-focused) .reveal-card.baseline {
    grid-column: 1;
    grid-row: 1/3;
  }
  .reveal-dialog:not(.intro):not(.state-focused) .reveal-card.loading {
    grid-column: 2;
    grid-row: 1;
  }
  .reveal-dialog:not(.intro):not(.state-focused) .reveal-card.empty {
    grid-column: 3;
    grid-row: 1;
  }
  .reveal-dialog:not(.intro):not(.state-focused) .reveal-card.failed {
    grid-column: 2;
    grid-row: 2;
  }
  .reveal-dialog:not(.intro):not(.state-focused) .reveal-card.recovered {
    grid-column: 3;
    grid-row: 2;
  }
  .reveal-dialog:not(.intro):not(.state-focused) .reveal-edges {
    display: none;
  }
  .reveal-card-top {
    height: 18px;
    font-size: 8px;
  }
  .reveal-card-bottom {
    height: 25px;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 4px 8px;
  }
  .reveal-card-bottom strong {
    font-size: 9px;
  }
  .reveal-card-bottom > span {
    font-size: 7px;
  }
  .reveal-shot {
    padding: 4px 6px 0;
  }
  .intro .reveal-card.baseline,
  .state-focused .reveal-card.selected {
    left: 10%;
    width: 80%;
  }
  .intro .reveal-card.baseline .reveal-card-top,
  .state-focused .reveal-card.selected .reveal-card-top {
    height: 24px;
  }
  .intro .reveal-card.baseline .reveal-card-bottom,
  .state-focused .reveal-card.selected .reveal-card-bottom {
    height: 28px;
  }
}
`
