import { FC, ReactNode, useState, ReactElement } from 'react';

interface TabPaneProps {
  tab: ReactNode;
  key: string;
  children: ReactNode;
}

interface TabsProps {
  activeKey?: string;
  defaultActiveKey?: string;
  onChange?: (key: string) => void;
  children: ReactElement<TabPaneProps>[]; // Specify children as an array of ReactElements with TabPaneProps
}

const TabPane: FC<TabPaneProps> = ({ children }) => {
  return <div>{children}</div>;
};

const Tabs: FC<TabsProps> & { TabPane: FC<TabPaneProps> } = ({
  activeKey,
  defaultActiveKey,
  onChange,
  children,
}) => {
  const [internalActiveKey, setInternalActiveKey] = useState<string>(defaultActiveKey || '');

  const handleChange = (key: string) => {
    if (onChange) {
      onChange(key);
    }
    setInternalActiveKey(key);
  };

  const activeTabKey = activeKey || internalActiveKey;

  return (
    <div className="flex flex-col h-full">
      <div className="flex border-b border-gray-200">
        {children.map((child) => {
          const isActive = activeTabKey === child.key;
          return (
            <div
              key={child.key}
              className={`px-4 py-2 cursor-pointer transition-colors ${
                isActive ? 'text-blue-600 border-b-2 border-blue-600 font-medium' : 'text-gray-600'
              }`}
              onClick={() => handleChange(child.key as string)}
            >
              {child.props.tab}
            </div>
          );
        })}
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {children.map((child) => {
          if (child.key === activeTabKey) {
            return child;
          }
          return null;
        })}
      </div>
    </div>
  );
};

Tabs.TabPane = TabPane;

export default Tabs;