import { ArrowLeftIcon, type Icon } from '@primer/octicons-react';
import { type FC, type ReactNode, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/App';
import { Size } from '../types';

interface IHeader {
  children: ReactNode;
  icon?: Icon;
  fetchOnBack?: boolean;
}

export const Header: FC<IHeader> = (props: IHeader) => {
  const navigate = useNavigate();

  const { fetchNotifications } = useContext(AppContext);

  return (
    <div className="mx-8 mt-2 flex items-center justify-between py-2">
      <button
        type="button"
        className="focus:outline-none"
        title="Go Back"
        onClick={() => {
          navigate(-1);
          if (props.fetchOnBack) {
            fetchNotifications();
          }
        }}
      >
        <ArrowLeftIcon
          size={Size.XLARGE}
          className="hover:text-gray-400"
          aria-label="Go Back"
        />
      </button>

      <h3 className="text-lg font-semibold flex items-center">
        <props.icon className="mr-2" />
        {props.children}
      </h3>
    </div>
  );
};
