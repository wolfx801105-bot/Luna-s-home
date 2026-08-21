# Welcome Home, Babygirl ♡

A cute, cozy moving-in checklist for a new home — 75 essentials sorted into little
sections, a pink progress card, sweet compliments drifting past, and a small
celebration when everything's ready.

Plain HTML, CSS and JavaScript. **No build step, no framework, no backend, no login.**
Everything is saved in the browser with `localStorage`, so ticks stay ticked after
closing the tab. Works offline once it has loaded.

---

## ✨ What it does

| | |
|---|---|
| 💌 **Floating compliments** | Little handwritten notes that fade in and out at random spots |
| ✅ **Check things off** | Big, thumb-friendly rows with a soft pink tick animation |
| 💾 **Remembers everything** | Saved instantly to `localStorage` — no account needed |
| ➕ **Add your own** | The `＋ Add something` button, with a section picker |
| ✏️ **Rename** | Tap the pencil on any row and edit it in place |
| 🗑️ **Delete** | Tap the bin — with an **Undo** button if you tap it by accident |
| ↺ **Reset** | Uncheck everything, or restore the original list completely |
| 📊 **Live progress** | `23 / 75 things ready ♡` plus a pink animated bar |
| 🎀 **Milestones** | Cheerful messages at 25%, 50%, 75% and 100% |
| 💕 **Celebration** | Floating hearts and flowers when the last thing is ticked |
| 🔍 **Filters** | *All · To do · Done* |
| 📱 **Mobile-first** | Designed for one hand; scales up to tablet and desktop |
| ♿ **Accessible** | Real checkboxes, keyboard support, focus rings, `prefers-reduced-motion` |
| ✈️ **Offline** | A tiny service worker caches the app after the first visit |

---

## 📁 The files

```
index.html            the whole page (plus the doodle illustration)
styles.css            all the styling
app.js                checklist logic + the floating compliments
sw.js                 service worker, for offline use
manifest.webmanifest  lets it be added to a phone home screen
icon.svg              the little house-and-heart icon
.nojekyll             tells GitHub Pages to serve the files as-is
README.md             this file
```

Nothing to install. Nothing to compile. You can double-click `index.html` right now
and it works. *(Offline caching only kicks in when it's served over http/https, so
it starts working once the site is on GitHub Pages.)*

---

## 🚀 Put it online with GitHub Pages

Two ways. **Option A needs no software at all** — just a browser.

### Option A — upload through the GitHub website (easiest)

**1. Create the repository**

1. Sign in at [github.com](https://github.com) (a free account is fine).
2. Click the **+** in the top-right → **New repository**.
3. **Repository name:** `welcome-home` (any name works — remember it, it becomes part of the address).
4. Choose **Public**. *GitHub Pages needs Public on a free account.*
5. Leave "Add a README file" **unticked**.
6. Click **Create repository**.

**2. Upload the files**

1. On the new empty repo page, click **uploading an existing file**
   (or go to **Add file → Upload files**).
2. Select **all the files** from this project — `index.html`, `styles.css`, `app.js`,
   `sw.js`, `manifest.webmanifest`, `icon.svg`, `.nojekyll`, `README.md` — and drag
   them into the box.
   > ⚠️ Upload the **files themselves**, not the folder that contains them.
   > `index.html` must sit at the top level of the repository, not inside a subfolder.
   > *(If `.nojekyll` is hidden on your computer: on Windows press <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>H</kbd>
   > in File Explorer, on Mac press <kbd>Cmd</kbd>+<kbd>Shift</kbd>+<kbd>.</kbd> — or just skip it, the site still works.)*
3. Scroll down and click **Commit changes**.

**3. Turn on GitHub Pages**

1. In the repository, click **Settings** (top bar).
2. In the left sidebar, click **Pages**.
3. Under **Build and deployment → Source**, choose **Deploy from a branch**.
4. Under **Branch**, set:
   - branch: **`main`**
   - folder: **`/ (root)`**  ← important, since `index.html` is at the top level
5. Click **Save**.

**4. Open the website**

Wait about **1–2 minutes** for the first build, then refresh the Pages settings page.
A green banner appears with the address:

```
https://YOUR-USERNAME.github.io/welcome-home/
```

Open it on your phone and — optionally — use **Share → Add to Home Screen** (iPhone)
or **⋮ → Add to Home screen** (Android) to keep it one tap away like a real app. 🌸

---

### Option B — from the command line

```bash
cd "path/to/this/folder"

git init
git add .
git commit -m "Welcome Home ♡"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/welcome-home.git
git push -u origin main
```

Then follow **step 3** above (Settings → Pages → Deploy from a branch → `main` → `/ (root)`).

---

### Updating it later

Edit a file → commit / re-upload → GitHub Pages rebuilds in a minute or two.

If you changed `index.html`, `styles.css` or `app.js`, also bump the version at the
top of `sw.js` so returning visitors get the new version instead of the cached one:

```js
var CACHE = 'welcome-home-v4';   // currently v3
```

---

## 🎨 Making it yours

**Change the checklist items** — `app.js`, the `DEFAULT_ITEMS` list near the top:

```js
['kitchen', 'Cups / Mugs'],
```

The first value is the section (`bedroom`, `bath`, `kitchen`, `clean`, `tech`,
`safety`, `cozy`, `mine`), the second is the label. Section names, emoji and the
little handwritten notes live just above in `SECTIONS`.

> Already-saved lists are **not** overwritten when you edit `DEFAULT_ITEMS` — the
> browser keeps what's stored. To see your new defaults, use **Reset → Start
> completely fresh** in the app.

**Change the colours** — `styles.css`, the `:root` block at the very top:

```css
--pink-500: #f78bb4;    /* the main pink */
--plum:     #8c4763;    /* headings */
--butter:   #ffe3a8;    /* the highlighter under "The Checklist" */
```

**Change the words** — the heading, the little message and the milestone lines are
in `index.html` and in the `milestone()` function in `app.js`.

**Change the greeting** — in `index.html`:

```html
<h1 class="hero-title">Welcome Home,<br><span class="name">Babygirl</span> ♡</h1>
```

**Change the floating compliments** — `app.js`, the `COMPLIMENTS` list. Each line is
the message and a tiny emoji to sit beside it (leave the emoji empty for none):

```js
['you’re gorgeous', '🌸'],
['you’re perfect ♡', ''],
```

They're drawn from a shuffled bag, so the same line never appears twice in a row.
To make them rarer or more frequent, adjust the timings in `scheduleNote()`; to turn
them off entirely, delete the `startCompliments();` line near the bottom of `app.js`.

**Fonts** — *Caveat* (handwritten) and *Quicksand* (body) load from Google Fonts,
with a system fallback if there's no connection. To go fully self-contained, delete
the two `<link rel="preconnect">` lines and the `fonts.googleapis.com` stylesheet
link from `index.html`; the fallback stack takes over automatically.

---

## 🩹 If something goes wrong

**The page loads but looks unstyled / broken**
`index.html`, `styles.css` and `app.js` need to sit **next to each other** at the top
level of the repository. If you uploaded a folder, open it in the repo, and re-upload
the files individually.

**404 page not found**
Give it a couple of minutes after the first save. Then check Settings → Pages shows
branch `main` and folder `/ (root)`, and that the file is named exactly `index.html`
(all lowercase).

**I changed something but the site looks the same**
That's the offline cache. Bump `CACHE` in `sw.js` (see *Updating it later*), or do a
hard refresh — <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>R</kbd> / <kbd>Cmd</kbd>+<kbd>Shift</kbd>+<kbd>R</kbd>.

**My ticks disappeared**
Progress is stored per browser, per device. It's lost by clearing site data, or when
using private/incognito mode — the app shows a gentle warning if it can't save.
Two people using two phones will each have their own copy of the list.

---

## 🔒 Privacy

There is no server, no database and no analytics. Nothing ever leaves the device —
the checklist lives in that browser's `localStorage` and nowhere else.

---

Made with ♡ for a new beginning. 🌸
