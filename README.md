# 🚗 Driving Lesson Hunter

A UK-focused web application that helps learner drivers find available driving test centres near them using **real data only**.

## Features

- **Real Data**: Uses official DVSA test centre data from GOV.UK
- **Free APIs**: Powered by postcodes.io for geocoding (no API keys required)
- **Distance Calculation**: Shows exact distances from your postcode
- **Responsive Design**: Works on mobile and desktop
- **Fast Search**: Find centres within 25-200 mile radius
- **No Fake Data**: Everything is sourced from official government datasets

## How It Works

1. Enter your UK postcode
2. Choose search radius (25-200 miles)
3. Get real DVSA test centres sorted by distance
4. See exact addresses and distances

## Data Sources

- **Test Centres**: Official DVSA CSV from `assets.dft.gov.uk`
- **Geocoding**: Free postcodes.io API
- **Distance**: Haversine formula for accurate calculations

## Tech Stack

- **Frontend**: Astro with vanilla JavaScript
- **Backend**: Astro API routes (serverless functions)
- **Hosting**: Netlify (auto-deploys from this repo)
- **Styling**: Modern CSS with gradients and responsive design

## Development

```bash
npm install
npm run dev
```

Visit `http://localhost:4321` to see the app.

## Deployment

This repo auto-deploys to Netlify. Push to main branch to deploy.

## Future Enhancements

- Public transport integration (when free APIs are available)
- Availability checking (when DVSA provides API access)
- Email/SMS notifications
- User accounts and saved searches

---

Built with ❤️ for UK learner drivers struggling to find test slots.
