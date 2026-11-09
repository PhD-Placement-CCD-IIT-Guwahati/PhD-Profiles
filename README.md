# IIT Guwahati PhD Talent Directory

A searchable website listing PhD scholars from every discipline, with thesis title, abstract, keywords, résumé link and contact details. Recruiters can search by discipline, keyword, name, email or phone number, and find the Centre for Career Development's contacts for PhD recruitment and MoUs.

## What's in this folder

| File | What it does | Do you edit it? |
|---|---|---|
| `candidates.xlsx` | The Excel sheet of scholars, one row per person (sheet **Candidates**) | **Yes: add, change or remove scholars here** |
| `photos/` | Optional folder for scholar photos | Add photos here if you like |
| `candidates.csv` | Same data as CSV, only used if you point `config.js` to it | No |
| `config.js` | Centre email, website and coordinator contacts; show or hide phone numbers | Occasionally |
| `index.html`, `style.css`, `app.js` | The website itself | No |
| `logo.png` | IIT Guwahati logo shown at the top (add it yourself) | Add once |

## 1. Publish on GitHub Pages (one time, about 10 minutes)

1. Sign in at github.com and create a new repository, for example `phd-directory`. Make it **Public**.
2. Click **Add file → Upload files**, drag in every file from this folder (plus `logo.png` if you have it), and click **Commit changes**.
3. Go to **Settings → Pages**. Under *Build and deployment*, choose **Deploy from a branch**, select **main** and **/ (root)**, then **Save**.
4. After a minute or two, the site is live at `https://<your-github-username>.github.io/phd-directory/`.

## 2. Add, change or remove scholars (Excel)

Open `candidates.xlsx` in Excel. Each row on the **Candidates** sheet is one scholar, with no limit on the number of rows. The **How to fill** sheet explains every column, and the discipline column has a dropdown.

| Column | Example |
|---|---|
| `name` | Priya Sharma |
| `discipline` | Electronics & Electrical Engineering (choose from the dropdown) |
| `photo_url` | `photos/priya-sharma.jpg`, or a Google Drive share link |
| `thesis_title` | Low-Power Photonic Interconnects for AI Accelerators |
| `abstract` | 3–5 sentences written for an industry reader |
| `keywords` | Photonics; VLSI; AI hardware *(separate with semicolons)* |
| `email` | priya.sharma@iitg.ac.in |
| `phone` | +91 98765 43210 |
| `resume_url` | `resumes/priya-sharma.pdf`, or a full `https://` link |

To update the website:

1. Edit `candidates.xlsx` in Excel: add a row, change cells, or delete a row. Keep the header row unchanged.
2. Save it (keep the name `candidates.xlsx`).
3. On GitHub, click **Add file → Upload files**, upload the file (it replaces the old one), and **Commit changes**. The site updates within a minute or two.

**Photos:** either upload photos into the `photos` folder on GitHub and write `photos/file-name.jpg` in `photo_url`, or paste a Google Drive share link (set to *Anyone with the link can view*; the site converts it automatically). Portrait photos around 400 × 500 pixels look best. If the photo is missing or the link doesn't work, the scholar's initials are shown instead.

**Disciplines** appear in the search dropdown automatically, with a count, based on the `discipline` column.

## 3. Optional: manage scholars in a Google Sheet (no uploads needed)

If several people update the list, a Google Sheet avoids uploading the Excel file each time. You can import `candidates.xlsx` into Google Sheets to start.


1. Put the same columns in a Google Sheet.
2. Click **File → Share → Publish to web**, choose the sheet, select **Comma-separated values (.csv)**, and **Publish**.
3. Copy the link and paste it into `config.js` as the `dataUrl` value.

Changes in the sheet then appear on the website automatically (Google can take a few minutes to refresh).

## 4. Résumé links

Upload each résumé as a PDF with a shareable link, for example in a `resumes` folder in this repository (`https://<username>.github.io/phd-directory/resumes/priya-sharma.pdf`) or on Google Drive with *Anyone with the link can view*.

## 5. Privacy and consent

The site is public. Before listing a scholar, get their written consent to publish their name, email, phone number, abstract and résumé, and delete their row if they withdraw consent. To hide all phone numbers, set `showPhone: false` in `config.js`. Keep home addresses, dates of birth and ID numbers out of shared résumés.

## 6. Shareable searches

Searches are reflected in the page address, so you can share a filtered view, for example `https://<username>.github.io/phd-directory/?discipline=Design`.
