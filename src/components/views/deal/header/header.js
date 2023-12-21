/* eslint-disable no-unused-vars */
import {
  FunnelPlotOutlined,
  LeftOutlined,
  ShopOutlined,
  TagsOutlined,
  TrophyOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useQuery } from "@apollo/react-hooks";
import { Button, Tooltip } from "antd";
import Avatar from "antd/lib/avatar/avatar";
import moment from "moment";
import React, { Fragment, useContext, useEffect, useState } from "react";
import { DealContext } from "../../../context/DealCotext";
import StepsHeader from "./stepsHeader";
import "./styles.scss";
import { DrawerContext } from "../../../context/DrawContext";
import { GET_USUARIO_ASIG } from "../../../../Graphql/queries/usuario";
import {
  GET_EMBUDOS,
  GET_ETAPAS_EMBUDOS,
} from "../../../../Graphql/queries/embudos";
import { conversionMonedaBase } from "../../../../utils/conversionMonedaBase";
import TagsList from "../../../tags/tagsList";
import TagItem from "../../../tags/tagItem";
import queryString from "query-string";

// const menu = (
//   <Menu>
//     <Menu.Item>
//       <span>Mostrar elementos activados</span>
//     </Menu.Item>
//   </Menu>
// );

const Header = ({ history, tags, stateGonzalo }) => {
  // Esto está mal--- tengo que agregar la variable del context
  const {
    deal,
    idPipeline,
    etaId,
    idUser,
    pipelineName,
    setPathname,
    cotizacionDolar,
    cotizacionReal,
    monConfig,
    monIsoBase,
    idMonConfig,
    setShowPanelTop,
    autorizado,
    setTagsList,
    etapasFinal,
    pipeURL,
    setPipeURL,
    esUsuarioAdmin,
  } = useContext(DealContext);
  const { setDrawerName, setDrawerDetail, showDrawer } =
    useContext(DrawerContext);

  //PIPE POR URL
  //  const url2 = window.location.search;
  //  const parsed2 = queryString.parse(url2);
  //  const pipePosition = parsed2.pipId;
  //  const idpipURL = Number( pipePosition);

  //  setPipeURL(idpipURL);

  const p = Number(localStorage.getItem("pipeURL"));
  setPipeURL(p);
  //setPipeURL(124) // para probar desde local
  //  console.log("Desde HEADER: ",pipeURL)

  const [pipName, setPipName] = useState("");

  const [namePipe, setNamePipe] = useState("");
  const [etaNombre, setEtaNombre] = useState("");
  const {
    neg_asunto,
    mon_iso,
    neg_valor,
    cli_nombre,
    con_nombre,
    usu_nombre,
    eta_id,
    neg_fechacierre,
    usu_asig_id,
  } = deal;

  //  console.log("pipe id desde header: ", pipeURL)

  const { data: dataPipeURL } = useQuery(GET_EMBUDOS, {
    variables: { pip_id: pipeURL },
    pollInterval: 2000,
  });
  //  console.log("dataPipeURL: ", dataPipeURL)

  const { data: usuAsig } = useQuery(GET_USUARIO_ASIG, {
    variables: { idUsuAsig: usu_asig_id },
  });

  const { data: dataCreador } = useQuery(GET_USUARIO_ASIG, {
    variables: { idUsuAsig: stateGonzalo?.usu_id },
  });

  const [valorMonedaBase, setValorMonedaBase] = useState(null);

  useEffect(() => {
    if (!deal) return;
    if (!usuAsig) return;
    if (dataPipeURL) {
      setPipName(dataPipeURL.getPipelinesResolver);
    }
  }, [deal, usuAsig, dataPipeURL]);

  useEffect(() => {
    if (pipName) {
      setNamePipe(pipName.filter((pip) => pip.pip_id == pipeURL));
    }
  }, [pipName]);

  const onClickGanado = () => {
    // getEtapa()
    setDrawerName("Negocio Ganado");
    setDrawerDetail("");
    showDrawer();
  };

  const onClickPerdido = () => {
    setDrawerName("Negocio Perdido");
    setDrawerDetail("");
    showDrawer();
    // setNegId(deal.neg_id);
  };

  const goToBack = () => {
    history.goBack();
    setPathname("/");
    setShowPanelTop(true);
  };
  const editTags = () => {
    if (!autorizado && idUser !== deal.usu_asig_id) return;

    const tagsListItems = tags.map((item) => {
      return { etq_id: item.etq_id };
    });

    setTagsList(tagsListItems);

    setDrawerName("Administrar etiquetas");
    showDrawer();
  };

  return (
    <Fragment>
      {stateGonzalo && (
        <div className="header_container">
          <div className="header_title_wrapper">
            <div className="header_title">
              <div className="header_title_back">
                <Tooltip placement="bottom" title={stateGonzalo.neg_asunto}>
                  <h1>{stateGonzalo.neg_asunto}</h1>
                </Tooltip>
              </div>

              <div className="header_info">
                {stateGonzalo.neg_valor !== 0 ? (
                  <p className="deal_amount">
                    <span>{mon_iso} </span>
                    <span>
                      {" "}
                      {stateGonzalo.neg_valor.toLocaleString("de-DE", {
                        maximumFractionDigits: 2,
                      })}
                    </span>{" "}
                    {/* {monConfig[0] &&
                      cotizacionDolar &&
                      monConfig[0].mon_id !== stateGonzalo.mon_id && (
                        <span className="base_currency">
                          (
                          <span style={{ marginRight: 5 }}> {monIsoBase} </span>
                          <Tooltip title="Valor equivalente a la moneda seleccionada en configuración del sistema">
                            {(
                              stateGonzalo.neg_valor / cotizacionDolar
                            ).toLocaleString("de-DE", {
                              maximumFractionDigits: 2,
                            })}
                          </Tooltip>
                          )
                        </span>
                      )} */}
                  </p>
                ) : (
                  <p className="deal_amount">
                    <span>{mon_iso} </span>
                    <span>
                      {" "}
                      {stateGonzalo.neg_valor.toLocaleString("de-DE", {
                        maximumFractionDigits: 2,
                      })}
                    </span>{" "}
                    {/* {monConfig[0] &&
                      cotizacionDolar &&
                      monConfig[0].mon_id !== stateGonzalo.mon_id && (
                        <span className="base_currency">
                          (
                          <span style={{ marginRight: 5 }}> {monIsoBase} </span>
                          <Tooltip title="Valor equivalente a la moneda seleccionada en configuración del sistema">
                            {(
                              stateGonzalo.neg_valor / cotizacionDolar
                            ).toLocaleString("de-DE", {
                              maximumFractionDigits: 2,
                            })}
                          </Tooltip>
                          )
                        </span>
                      )} */}
                  </p>
                )}
                <div className="deal_business">
                  <ShopOutlined style={{ fontSize: 20, marginRight: 5 }} />
                  <span>{cli_nombre}</span>
                </div>
                {con_nombre && (
                  <div className="deal_contact">
                    <UserOutlined style={{ fontSize: 20, marginRight: 5 }} />
                    <span>{con_nombre}</span>
                  </div>
                )}
                <div className="deal_pipe">
                  {namePipe && (
                    <>
                      <FunnelPlotOutlined
                        style={{ fontSize: 20, marginRight: 5 }}
                      />
                      <span>{namePipe[0]?.pip_nombre}</span>
                      {/* {console.log(namePipe[0].pip_nombre)} */}
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="header_right_wrapper">
              <div className="header_buttons">
                <div className="user">
                  <div className="avatar">
                    {" "}
                    <Avatar
                      size={35}
                      style={{ marginRight: 10 }}
                      icon={<UserOutlined />}
                    />
                  </div>
                  <div className="info_avatar">
                    {dataCreador && (
                      <span className="username">
                        {dataCreador.getUsuAsigResolver[0].usu_nombre}
                      </span>
                    )}

                    <span className="role">Creador</span>
                  </div>

                  <div className="info_avatar">
                    {usuAsig && (
                      <span className="username">
                        {usuAsig.getUsuAsigResolver[0].usu_nombre}
                      </span>
                    )}

                    <span className="role">Asignado</span>
                  </div>
                </div>
                {stateGonzalo.neg_estado === 0 && (
                  <Fragment>
                    <div className="ganado">
                      <Button
                        type="primary"
                        style={{ margin: "0 5px" }}
                        onClick={onClickGanado}
                        disabled={
                          stateGonzalo.usu_asig_id !== idUser && !esUsuarioAdmin
                        }
                      >
                        Ganado
                      </Button>
                    </div>
                    <div className="perdido">
                      <Button
                        type="primary"
                        danger
                        style={{ margin: "0 5px" }}
                        onClick={onClickPerdido}
                        disabled={
                          stateGonzalo.usu_asig_id !== idUser && !esUsuarioAdmin
                        }
                      >
                        Perdido
                      </Button>
                    </div>
                  </Fragment>
                )}
                {stateGonzalo.neg_estado === 1 && (
                  <div className="ganado">
                    <Button type="primary" style={{ margin: "0 5px" }}>
                      Ganado
                    </Button>
                  </div>
                )}
                {stateGonzalo.neg_estado === 2 && (
                  <div className="perdido">
                    <Button type="primary" danger style={{ margin: "0 5px" }}>
                      Perdido
                    </Button>
                  </div>
                )}
                {/* {history.location.state && ( */}
                {/* <div className="filtros">
                  <Button
                    type="ghost"
                    onClick={goToBack}
                    style={{ marginLeft: 5 }}
                  >
                    <LeftOutlined /> <span>Volver</span>
                  </Button>
                </div> */}
                {/* )} */}
              </div>

              <div className="tags_deal_wrapper">
                {tags.length === 0 && (
                  <Tooltip placement="right" title="Administrar etiquetas">
                    <Button
                      onClick={editTags}
                      type="dashed"
                      size={"small"}
                      disabled={
                        !autorizado && idUser !== stateGonzalo.usu_asig_id
                      }
                      icon={<TagsOutlined />}
                    ></Button>
                  </Tooltip>
                )}
                {tags.length > 0 && (
                  <TagsList>
                    {tags.map((tag) => {
                      const { etq_color, etq_id, etq_nombre } = tag;
                      return (
                        <TagItem
                          title={etq_nombre}
                          key={etq_id}
                          color={etq_color}
                          inDeal={true}
                        />
                      );
                    })}
                  </TagsList>
                )}
              </div>
            </div>
          </div>

          <StepsHeader
            stateGonzalo={stateGonzalo}
            etaIdNegocio={eta_id}
            setEtaNombre={setEtaNombre}
            etapasFinal={etapasFinal}
          />
          <div className="header_steps_footer">
            <div className="start">{etaNombre}</div>
            <div className="finish">
              <TrophyOutlined style={{ marginRight: 5 }} />
              {moment(stateGonzalo.neg_fechacierre).format("LL")}
            </div>
          </div>
        </div>
      )}
    </Fragment>
  );
};

export default Header;
