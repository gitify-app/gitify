import { ArrowLeftIcon } from '@primer/octicons-react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface IHeader {
  children: ReactNode;
}

export const Header = ({ children }: IHeader) => {
  const navigate = useNavigate();
  return (
    <div className="mx-8 mt-4 flex items-center justify-between py-2">
      <button
        type="button"
        className="focus:outline-none"
        title="Go Back"
        onClick={() => navigate(-1)}
      >
        <ArrowLeftIcon
          size={20}
          className="hover:text-gray-400"
          aria-label="Go Back"
        />
      </button>

      <h3 className="text-lg font-semibold">{children}</h3>
    </div>
  );
};
