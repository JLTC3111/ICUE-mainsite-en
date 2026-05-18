from pathlib import Path
import re

root = Path(__file__).resolve().parents[1]
html_path = root / 'src/pages/donations.html'
replacement = (root / 'scripts/donation-payment-block.html').read_text()

text = html_path.read_text()
text2, n = re.subn(
    r'        <div class="donation-type">[\s\S]*?        <div class="donor-info">',
    replacement,
    text,
    count=1,
)
if not n:
    raise SystemExit('donation-type block not found')

text2 = text2.replace(
    '        <button type="submit" class="donate-btn">\n          Donate $<span id="donateAmount">100</span>\n        </button>',
    '        <button type="submit" class="donate-btn" id="donateSubmitBtn">\n          <span class="btn-spinner" aria-hidden="true"></span>\n          <span class="btn-label">Donate <span id="donateAmount">1.000.000</span> ₫</span>\n        </button>',
)

html_path.write_text(text2)
print('patched', html_path)
