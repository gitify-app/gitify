import * as TestRenderer from 'react-test-renderer';

import { Form } from 'react-final-form';
import { FieldInput, type IFieldInput } from './FieldInput';

describe('components/fields/FieldInput.tsx', () => {
  const props: IFieldInput = {
    name: 'appearance',
    label: 'Appearance',
    placeholder: 'This is some placeholder text',
    helpText: 'This is some helper text',
  };

  it('should render', () => {
    const tree = TestRenderer.create(
      <Form
        onSubmit={() => {}}
        hand
        render={({ handleSubmit }) => (
          <form onSubmit={handleSubmit}>
            <FieldInput {...props} />
          </form>
        )}
      />,
    );
    expect(tree).toMatchSnapshot();
  });
});
