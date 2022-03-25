import React, {Component} from 'react'
import {connect} from 'react-redux'
import {createSelector} from 'reselect'
import {Container, Row, Col, ListGroup, ListGroupItem, FormGroup, ControlLabel, FormControl, OverlayTrigger, Tooltip} from 'react-bootstrap'

import {store} from 'views/create-store'

import {join} from 'path'

import {extensionSelectorFactory} from 'views/utils/selectors'

const EXTENSION_KEY = 'poi-plugin-antisub';

const pluginDataSelector = createSelector(
  extensionSelectorFactory(EXTENSION_KEY),
  (state) => state || {}
)

const MaxAntiSub = 100;

export const reactClass = connect(
  state => ({
    horizontal: state.config.poi.layout || 'horizontal',
    $ships: state.const.$ships,
    ships: state.info.ships,
    fleets: state.info.fleets,
    $equips: state.const.$equips,
    equips: state.info.equips,
    $shipTypes: state.const.$shipTypes
  }),
  null, null, {pure: false}
)(class PluginFetchTaisen extends Component {
  constructor(props) {
    super(props)
    this.state = {
      test:"testinfo",
      v1:"v1"
    }
  }

  loadstate(){
    var v1 = this.state.v1;
    console.log("v1:"+v1);
  }

  setstate(){
    var v1 = this.state.v1;
    console.log("v1:"+v1);
    if(v1!="v2"){
      this.setState({v1:"v2"});
    }
  }

  getfleetmap() {
    let fleetarr = this.props.fleets;
    let fleetmap = {};
    for (let i = 0; i < fleetarr.length; i++) {
      let nships = fleetarr[i].api_ship;
      for (let j = 0; j < nships.length; j++) {
        fleetmap[nships[j]] = i + 1;
      }
    }
    return fleetmap;
  }

  getAllTaiSenShip() {
    try {
      let ret = this.getAllTaisenShipD();
      return ret;
    } catch (e) {
      console.log(e);
      return "unknown error";
    }
  }

  getShipTypeAndName(infoshipid) {
    let shipinfo = this.props.$ships[infoshipid];
    if (shipinfo == undefined) {
      return ["error", "error"]
    }
    let shiptype = shipinfo.api_stype;
    let shipname = shipinfo.api_name;
    let shipTypeInfo = this.props.$shipTypes[shiptype];
    let shipTypeStr = shipTypeInfo.api_name;
    return [shipTypeStr, shipname];
  }

  getAllTaisenEquipTypes() {
    let allEquipTypes = this.props.$equips;
    let ret = {};
    for (let p in allEquipTypes) {
      let tais = allEquipTypes[p].api_tais;
      let name = allEquipTypes[p].api_name;
      if (tais > 0) {
        ret[p] = [tais, name];
      }
    }
    return ret;
  }

  getAllTaisenEquips() {
    let taisenEquipTypes = this.getAllTaisenEquipTypes();
    let allEquips = this.props.equips;
    let ret = {};
    let cret = {};
    for (let p in allEquips) {
      let equipid = allEquips[p].api_slotitem_id;
      let taisArr = taisenEquipTypes[equipid];
      if (taisArr) {
        let tais = taisArr[0];
        let name = taisArr[1];
        ret[p] = tais;
        if (cret[tais] == undefined) {
          cret[tais] = {count: 0};
        }
        if (cret[tais][name] == undefined) {
          cret[tais][name] = 0;
        }
        cret[tais].count++;
        cret[tais][name]++;
      }
    }
    let tret = [];
    tret[0] = cret[6] ? (cret[6]["九三式水中聴音機"] ? cret[6]["九三式水中聴音機"] : 0) : 0;
    tret[1] = cret[10] ? (cret[10]["三式水中探信儀"] ? cret[10]["三式水中探信儀"] : 0) : 0;
    tret[2] = cret[12] ? (cret[12]["四式水中聴音機"] ? cret[12]["四式水中聴音機"] : 0) : 0;
    tret[3] = cret[11] ? (cret[11]["Type124 ASDIC"] ? cret[11]["Type124 ASDIC"] : 0) : 0;
    tret[4] = cret[13] ? (cret[13]["Type144/147 ASDIC"] ? cret[13]["Type144/147 ASDIC"] : 0) : 0;
    tret[5] = cret[15] ? (cret[15]["HF/DF + Type144/147 ASDIC"] ? cret[15]["HF/DF + Type144/147 ASDIC"] : 0) : 0;
    tret[6] = cret[11] ? (cret[11]["三式水中探信儀改"] ? cret[11]["三式水中探信儀改"] : 0) : 0;
    return [ret, cret, tret];
  }

  getAllTaisenShipD() {
    let fleetmap = this.getfleetmap();
    let allships = this.props.ships;
    let allTaisenEquipsArr = this.getAllTaisenEquips();
    let allTaisenEquips = allTaisenEquipsArr[0];
    let taisenEquips = allTaisenEquipsArr[2];
    if (MaxAntiSub < 100) { // test only
      if (taisenEquips[4] == 0) {
        taisenEquips[4] = 2;
      }
      if (taisenEquips[3] < 2) {
        taisenEquips[3] += 4;
      }
    }
    let taisenships = {};
    let shiplvarr = [];
    for (let p in allships) {
      let ship = allships[p];
      let shipSpecial = false;
      var shipid = ship.api_ship_id;
      var oriship = this.props.$ships[shipid];
      var stype = oriship.api_stype;
      var antisub=MaxAntiSub;
      if(stype==1){//海防舰
        antisub=60;
      }
      else if(shipid==141||shipid==278||shipid==424||shipid==319||shipid==320||shipid==361||shipid==428||shipid==429||shipid==369||shipid==362){//無條件發動
        antisub=0;
        shipSpecial = true;
      }

      let taisen = ship.api_taisen[0];
      let slots = ship.api_slot;
      let equiptaisen = 0;
      for (let i = 0; i < slots.length; i++) {
        let equipid = slots[i];
        if (allTaisenEquips[equipid]) {
          equiptaisen += allTaisenEquips[equipid];
        }
      }
      let oritaisen = taisen - equiptaisen;
      //let slotnum = ship.api_slotnum;
      let slotnum = 1;
      if (oritaisen + 15 > antisub || shipSpecial) {
        let infoshipid = ship.api_ship_id;
        let shiptypenamearr = this.getShipTypeAndName(infoshipid);
        let shiptype = shiptypenamearr[0];
        let shipname = shiptypenamearr[1];
        if (taisenships[shiptype] == undefined) {
          taisenships[shiptype] = []
        }
        let bestEquipArr = this.getBestEquip([shipname, ship.api_lv, oritaisen, slotnum], taisenEquips,antisub,shipSpecial);
        taisenships[shiptype].push([shipname, ship.api_lv, oritaisen, slotnum, bestEquipArr[0], bestEquipArr[1]]);
        
      }

    }
    for (let p in taisenships) {
      let list = taisenships[p];
      list.sort(function (a, b) {
        return ((b[5] << 8) + b[1]) - ((a[5] << 8) + a[1])
      });
    }
    return [fleetmap, taisenships, taisenEquips];
  }

  getBestEquip(ship, taisenEquips,antisub,shipSpecial) {
    let oritaisen = ship[2];
    //let slotnum = ship[3];
    let slotnum = 1;
    let needEquipTaisen = antisub - oritaisen;
    let ret = [];
    let can = 1;
    if(shipSpecial || ship[0]=="Jervis" || ship[0]=="Jervis改"|| ship[0]=="Janus"|| ship[0]=="Janus改"|| ship[0]=="Samuel B.Roberts改"|| ship[0]=="Fletcher"|| ship[0]=="Fletcher改"|| ship[0]=="Fletcher改 Mod.2"|| ship[0]=="Fletcher Mk.II"|| ship[0]=="Johnston"|| ship[0]=="Johnston改"){
    }
    else if(needEquipTaisen <= 0){
      ret = [0];
    }
    else if(needEquipTaisen <= 6 ){
      ret = [0];
    }else if(needEquipTaisen <= 10){
      ret = [1];
    }else if(needEquipTaisen <= 11){
      ret = [2,3];
    }else if(needEquipTaisen <= 12){
      ret = [4];
    }else if(needEquipTaisen <= 13){
      ret = [5];
    }else if(needEquipTaisen <= 15){
      ret = [6];
    }else{
      can = 0;
    }
    return [ret, can];
  }


  render() {
    const taiseninfo = this.getAllTaiSenShip();
    const fleetmap = taiseninfo[0];
    const alltaisenships = taiseninfo[1];
    const taisenEquips = taiseninfo[2];
    let shiptypes = ["駆逐艦", "軽巡洋艦", "重雷装巡洋艦", "練習巡洋艦","海防艦"];
    let list = [];
    const drawEquip = (ret) => {
      let hret = [];
      for (let i = 0; i < ret.length; i++) {
        if (ret[i] == 0) {
          hret.push(<span><img style={{width:"20px"}} src="assets/img/slotitem/118.png"></img><span className="badge badge-small">九三式</span></span>)
        } else if (ret[i] == 1) {
          hret.push(<span><img style={{width:"20px"}} src="assets/img/slotitem/118.png"></img><span className="badge badge-small">三式</span></span>)
        } else if (ret[i] == 2) {
          hret.push(<span><img style={{width:"20px"}} src="assets/img/slotitem/118.png"></img><span className="badge badge-small">三式改</span></span>)
        } else if (ret[i] == 3) {
          hret.push(<span><img style={{width:"20px"}} src="assets/img/slotitem/118.png"></img><span className="badge badge-small">Type124</span></span>)
        } else if (ret[i] == 4) {
          hret.push(<span><img style={{width:"20px"}} src="assets/img/slotitem/118.png"></img><span className="badge badge-small">四式</span></span>)
        } else if (ret[i] == 5) {
          hret.push(<span><img style={{width:"20px"}} src="assets/img/slotitem/118.png"></img><span className="badge badge-small">Type144/147</span></span>)
        } else if (ret[i] == 6) {
          hret.push(<span><img style={{width:"20px"}} src="assets/img/slotitem/118.png"></img><span className="badge badge-small">HF/DF + Type144/147</span></span>)
        }
      }
      return hret;
    };



    shiptypes.map((shiptype) => {
      let shipList = alltaisenships[shiptype];
      if (shipList) {
        list.push(
          <ListGroupItem active>
            <span className="title-type">
              {[shiptype, <span className="badge">{shipList ? shipList.length : 0}</span>]}
            </span>
          </ListGroupItem>
        );
        shipList = shipList ? shipList : [];
        shipList.map((ship) => {
          list.push(
            <ListGroupItem className={ship[5] ? "" : "disabled"}>
              <Row>
                <Col xs={4}>
                  
                    <span>lv.{ship[1]} {ship[0]}</span>
    
                </Col>
                <Col xs={8}>
                  {drawEquip(ship[4])}
                </Col>
              </Row>
            </ListGroupItem>
          )
        })
      }
    });
    let eqlist = [];
    if (taisenEquips[6] > 0) {
      eqlist.push(<span><img style={{width:"20px"}} src="assets/img/slotitem/118.png"></img>HF/DF + Type144/147<span className="badge">{taisenEquips[5]}</span></span>)
    }
    if (taisenEquips[5] > 0) {
      eqlist.push(<span><img style={{width:"20px"}} src="assets/img/slotitem/118.png"></img>Type144/147<span className="badge">{taisenEquips[4]}</span></span>)
    }
    if (taisenEquips[4] > 0) {
      eqlist.push(<span><img style={{width:"20px"}} src="assets/img/slotitem/118.png"></img>四式<span className="badge">{taisenEquips[2]}</span></span>)
    }
    if (taisenEquips[3] > 0) {
      eqlist.push(<span><img style={{width:"20px"}} src="assets/img/slotitem/118.png"></img>Type124<span className="badge">{taisenEquips[3]}</span></span>)
    }
    if (taisenEquips[2] > 0) {
      eqlist.push(<span><img style={{width:"20px"}} src="assets/img/slotitem/118.png"></img>三式改<span className="badge">{taisenEquips[6]}</span></span>)
    }
    if (taisenEquips[1] > 0) {
      eqlist.push(<span><img style={{width:"20px"}} src="assets/img/slotitem/118.png"></img>三式<span className="badge">{taisenEquips[1]}</span></span>)
    }
    if (taisenEquips[0] > 0) {
      eqlist.push(<span><img style={{width:"20px"}} src="assets/img/slotitem/118.png"></img>九三式<span className="badge">{taisenEquips[0]}</span></span>)
    }
    
    
    
    
    
    
    
    return (
      <div id="antisub" className="antisub">
        <link rel="stylesheet" href={join(__dirname, 'antisub.css')}/>
        
        <ListGroup>
          <ListGroupItem>
            <Row>
              <Col xs={4}>
                { "装备统计" }
              </Col>
              
            </Row>
            <Row>
            <div className="equip-count">
          {eqlist}
        </div>
            </Row>
          </ListGroupItem>
        </ListGroup>
        <ListGroup className="list-container">
          { list }
        </ListGroup>
      </div>
    )
  }
});