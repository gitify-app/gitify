declare const __brand: unique symbol;

type Brand<B> = { [__brand]: B };

export type Branded<T, B> = T & Brand<B>;

export type URL = Branded<string, 'URL'>;

export type Token = Branded<string, 'Token'>;

export type ClientID = Branded<string, 'ClientID'>;

export type ClientSecret = Branded<string, 'ClientSecret'>;

export type HostName = Branded<string, 'HostName'>;
