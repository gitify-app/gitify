// import original module declaration
import 'styled-components';

// and extend it
declare module 'styled-components' {
  export interface DefaultTheme {
    borderRadius: string;

    primary: string;
    success: string;
    info: string;
    warning: string;
    danger: string;

    grayLighter: string;
    grayLight: string;

    purple: string;
    purpleDark: string;
  }
}
