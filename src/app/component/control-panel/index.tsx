import { useState } from "react";
import Tabs from "../tab";
import FK from "./FK";
import IK from "./IK";

const ControPanel = ()=>{
    const [activeTab,setActiveTab] = useState('fk')
    return <Tabs defaultActiveKey="control" activeKey={activeTab} onChange={setActiveTab}>
    <Tabs.TabPane tab="FK" key="fk">
      <FK/>
    </Tabs.TabPane>
    <Tabs.TabPane tab="IK" key="ik">
      <IK />
    </Tabs.TabPane>
  </Tabs>
}
export default ControPanel;