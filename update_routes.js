const fs = require('fs');
let code = fs.readFileSync('frontend/src/router/routes.ts', 'utf8');

const target = `      {
        path: "profile",
        element: React.createElement(ProfilePage),
      },`;

const replacement = `      {
        path: "profile",
        element: React.createElement(ProfilePage),
      },
      {
        path: "manual-guide",
        element: React.createElement(ManualGuidePage),
      },`;

code = code.split(target).join(replacement);
fs.writeFileSync('frontend/src/router/routes.ts', code);
