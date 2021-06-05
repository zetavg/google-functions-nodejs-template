import { HttpFunction } from '@google-cloud/functions-framework/build/src/functions';

import { getGreeting } from './strings';

export const entry: HttpFunction = (req, res) => {
  res.send(getGreeting(req.query.name));
};

// Support some common Google Cloud Functions entry points
export const index = entry;
export const helloWorld = entry;
