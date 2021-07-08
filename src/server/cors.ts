const LOCALHOST = /localhost:\d+/;

export const Origins = {
  LOCALHOST,
  // TODO: Return false in production when cors types are updated:
  // https://github.com/DefinitelyTyped/DefinitelyTyped/pull/54368
  LOCALHOST_IN_DEVELOPMENT:
    process.env.NODE_ENV === 'production' ? '' : LOCALHOST,
};
