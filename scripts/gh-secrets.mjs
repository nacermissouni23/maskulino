// Create GitHub Actions secrets. Values via env (never committed).
// Usage: GH_TOKEN=... SECRETS_JSON='{"A":"1"}' node scripts/gh-secrets.mjs
import sodium from "tweetsodium";

const token = process.env.GH_TOKEN;
const secrets = JSON.parse(process.env.SECRETS_JSON || "{}");
const repo = "nacermissouni23/maskulino";
const H = { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" };

const pub = await (await fetch(`https://api.github.com/repos/${repo}/actions/secrets/public-key`, { headers: H })).json();
for (const [name, value] of Object.entries(secrets)) {
  const sealed = Buffer.from(
    sodium.seal(Buffer.from(String(value)), Buffer.from(pub.key, "base64"))
  ).toString("base64");
  const r = await fetch(`https://api.github.com/repos/${repo}/actions/secrets/${name}`, {
    method: "PUT", headers: { ...H, "Content-Type": "application/json" },
    body: JSON.stringify({ encrypted_value: sealed, key_id: pub.key_id }),
  });
  console.log(`${name} ${r.status === 201 || r.status === 204 ? "OK" : "FAIL " + r.status}`);
}
