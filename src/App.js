/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable array-callback-return */

import { useQuery, useMutation, useLazyQuery } from "@apollo/react-hooks";
import { ConfigProvider } from "antd";
import esES from "antd/lib/locale/es_ES";
import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { DealContext } from "./components/context/DealCotext";
import { DrawerContext } from "./components/context/DrawContext";
import { NoteContext } from "./components/context/NoteContext";
import Layout from "./components/layout/layout";
import Deal from "./components/views/deal";
import Pipeline from "./components/views/pipeline/pipeline";
import RigthPanel from "./components/views/pipeline/rightPanel/rigthPanel";
import ViewTable from "./components/views/table/viewTable";
import { UPDATE_ETAPA_POR_NEGOCIO } from "./Graphql/mutations/etapas";
import { NEW_HISTORIAL_NEGOCIO } from "./Graphql/mutations/historial";
import { GET_EMBUDOS } from "./Graphql/queries/embudos";
import "./less/antd.less";
import queryString from "query-string";

import Graphics from "./components/views/graphics";
import {
  GET_GRUPOS_Y_USUARIOS,
  GET_GRUPO_POR_USUARIO,
  GET_USUARIOS_ASIG_NEGOCIOS,
} from "./Graphql/queries/usuario";
import { permisos } from "./utils/permisos";
import PanelTop from "./components/views/pipeline/panelTop/paneltop";
import { GET_CONFIG } from "./Graphql/queries/config";
import { GET_COTIZACION } from "./Graphql/queries/cotizacion";
import usePollAlertSubscription from "./Graphql/subscriptions/usePollAlertSubscription";

const App = () => {
  const [stateDrawer, setStateDrawer] = useState({
    visible: false,
    childrenDrawer: false,
  });
  const [tagClose, setTagClose] = useState(false);
  const [drawerName, setDrawerName] = useState("AGREGAR_NEGOCIO");
  const [drawerDetail, setDrawerDetail] = useState("");
  const [newPipelineState, setNewPipelineState] = useState(false);
  const [drawerNameChildren, setDrawerNameChildren] = useState("");
  const [idPipeline, setIdPipeline] = useState(null);
  const [allSteps, setAllSteps] = useState([]);
  const [steps, setSteps] = useState([]);
  const [cards, setCards] = useState([]);
  const [negId, setNegId] = useState(null);
  const [etaId, setEtaId] = useState(null);
  const [etaPreviaId, setEtaPreviaId] = useState(null);
  const [idEstado, setIdEstado] = useState(0);
  const [history, setHistory] = useState(null);
  const [filterDate, setFilterDate] = useState([]);
  const [filterTypeDate, setFilterTypeDate] = useState("creacion");
  const [deal, setDeal] = useState({});
  const [products, setProducts] = useState([]);
  const [dealProducts, setDealProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [dealTotalProducts, setDealTotalProducts] = useState(0);
  const [competitors, setCompetitors] = useState([]);
  const [dealCompetitors, setDealCompetitors] = useState([]);
  const [pathname, setPathname] = useState("");
  const [note, setNote] = useState("");
  const [idUser, setIdUser] = useState(null);
  const [filterIdUser, setFilterIdUser] = useState(null);
  const [sharedUsers, setSharedUsers] = useState([]);
  const [loadingSuma, setLoadingSuma] = useState(false);

  const [clientesParaFiltro, setClientesParaFiltro] = useState([]);
  const [filterCliente, setFilterCliente] = useState();

  const [notId, setNotId] = useState(null);
  const [task, setTask] = useState({});
  const [view, setView] = useState("/");
  const [grupos, setGrupos] = useState([]);
  const [pipelineName, setPipelineName] = useState("");
  const [usuariosAsignados, setUauriosAsignados] = useState([]);
  const [autorizado, setAutorizado] = useState(false);
  const [monConfig, setMonConfig] = useState({});
  const [idMonConfig, setIdMonConfig] = useState(1);
  const [monIsoBase, setMonIsoBase] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [cotizacionDolar, setCotizacionDolar] = useState(null);
  const [cotizacionReal, setCotizacionReal] = useState(null);
  const [fechaCotizacion, setFechaCotizacion] = useState(null);
  const [cambioMoneda, setCambioMoneda] = useState(false);
  const [datosPorEtapa, setDatosPorEtapa] = useState([]);
  const [totalAcumulado, setTotalAcumulado] = useState(0);
  const [porcentajeTotal, setPorcentajeTotal] = useState(0);
  const [reloadingApp, setReloadingApp] = useState(false);
  const [showPanelTop, setShowPanelTop] = useState(true);
  const [tagsList, setTagsList] = useState([]);
  const [tagsListFilter, setTagsListFilter] = useState([]);
  const [tagsNegId, setTagsNegId] = useState(null); // se necesita para la query donde se guardan las etiquetas
  const [dealNumber, setDealNumber] = useState(0);
  //! Estado para guardar etaId cuando se elegi caja en newdealform
  const [etaIdParaForm, setEtaIdParaForm] = useState();
  //! Estado para pintar las etapas dentro de la vista de negocio
  const [etapasFinal, setEtapasFinal] = useState([]);
  //! maneja logica del spin de carga para vista pipeline desde panelTop
  const [pipelineSpin, setPipelineSpin] = useState(2);
  //! maneja la logica del result para saber si hay embudos o no, desarticular logica del componente pipeline
  const [pipelineFlag, setPipelineFlag] = useState(true);
  //! maneja la logica del result para saber si hay etapas o no, desarticular logica del componente pipeline
  const [etapasFlag, setEtapasFlag] = useState(true);

  const [filterDestacadas, setFilterDestacadas] = useState(false);

  const [totalNegociosPorEtapa, setTotalNegociosPorEtapa] = useState([]);

  //* handle state para banner de filtros
  const [nombreCliFiltrado, setNombreCliFiltrado] = useState("");
  const [nombreUsuFiltrado, setNombreUsuFiltrado] = useState("");

  //* Estados para cambiar logica de negocio y poder administrar supervisor y admin
  const [listadoUsuariosSupervisados, setListadoUsuariosSupervisados] =
    useState([]);

  const [esUsuarioSupervisor, setEsUsuarioSupervisor] = useState(false);
  const [esUsuarioAdmin, setEsUsuarioAdmin] = useState(false);
  const [listadoGruposDelSupervisor, setListadoGruposDelSupervisor] = useState(
    []
  );
  const [loadingHeader, setLoadingHeader] = useState(false);

  const [pollNegocios, setPollNegocios] = useState();
  const [pollValoresEtapa, setPollValoresEtapa] = useState();
  const [pollEtapas, setPollEtapas] = useState();

  //* handle transfer clientes para negocio masivo
  const [listadoClientesMasivo, setListadoClientesMasivo] = useState([]);
  //* handle tarea para negocio masivo
  const [masiveTask, setMasiveTask] = useState(null);
  const [usuAsigMasiveTask, setUsuAsigMasiveTask] = useState();

  //! DASHBOARD ANALITICO REMASTERED

  const [pipelineSelected, setPipelineSelected] = useState(-1); //* -1 para TODOS
  const [estadoSelected, setEstadoSelected] = useState("abierto");
  const [currentTab, setCurrentTab] = useState("1");

  const { data: cotizacion, loading } = useQuery(GET_COTIZACION, {});
  const {
    data: getEmbudos,
    stopPolling: stopPollingEmbudos,
    startPolling: startPollingEmbudos,
  } = useQuery(GET_EMBUDOS);

  const { data: getConfig } = useQuery(GET_CONFIG, {});
  const { data: getUsuariosAsignados } = useQuery(GET_USUARIOS_ASIG_NEGOCIOS);
  
  const [getGrupo, { data: getGrupoPorUsuario }] = useLazyQuery(
    GET_GRUPO_POR_USUARIO
  );
  const [updateEtapaxNegocioResolver] = useMutation(UPDATE_ETAPA_POR_NEGOCIO);
  const [newHistorialNegocioResolver] = useMutation(NEW_HISTORIAL_NEGOCIO);

  const getGrupoYUsuarios = useQuery(GET_GRUPOS_Y_USUARIOS, {
    variables: { idUsuario: idUser },
  });

  const onClickNewPipeline = () => {
    setDrawerName("Nuevo Embudo");
    setDrawerDetail("");
    showDrawer();
    setNewPipelineState(false);
  };

  const [pipeURL, setPipeURL] = useState();

  //* SUBSCRIPTION READ AND POLLS
  const x = usePollAlertSubscription();
  useEffect(() => {
    if (x.data) {
      const subsResponse = x.data.pollAlertSubscription;
      const { message } = subsResponse;

      if (pollNegocios && pollValoresEtapa && pollEtapas) {
        startPollingEmbudos(1000);
        setTimeout(() => {
          stopPollingEmbudos();
        }, 2000);

        pollNegocios.initial(1000);
        setTimeout(() => {
          pollNegocios.close();
        }, 2000);

        pollValoresEtapa.initial(1000);
        setTimeout(() => {
          pollValoresEtapa.close();
        }, 2000);

        pollEtapas.initial(1000);
        setTimeout(() => {
          pollEtapas.close();
        }, 2000);
      }
    }
  }, [x]);

  useEffect(() => {

    //*original
    // const url = window.location.search;   
    // const equalPosition = url.lastIndexOf("=");    
    // const idUserURL = Number(url.slice(equalPosition + 1));

    const url = window.location.search;
    const parsed = queryString.parse(url);   
    const equalPosition = parsed.userId;    
    const idUserURL = Number( equalPosition);

    setIdUser(idUserURL);

    //setIdUser(1)//para probar desde local

    // //ETAPA POR URL
    // const url2 = window.location.search;
    // const parsed2 = queryString.parse(url2);   
    // const pipePosition = parsed2.pipId;    
    // const idpipURL = Number( pipePosition);

    // console.log("Desde APP: ",idpipURL)
    // setPipeURL(idpipURL);

    getGrupo({ variables: { idUsuario: idUserURL } });

    if (getEmbudos && idPipeline === null) {
      if (getEmbudos.getPipelinesResolver.length !== 0) {
        setPipelineFlag(true);
        setIdPipeline(Number(getEmbudos.getPipelinesResolver[0].pip_id));
        setPipelineName(getEmbudos.getPipelinesResolver[0].pip_nombre);
      } else {
        setIdPipeline(null);
        setPipelineFlag(false);
      }
    }

    if (!getGrupoPorUsuario) return;
    let gru = [];
    getGrupoPorUsuario.getGrupoByUsuarioResolver.map((grupo) => {
      if (grupo.gru_id === 1) {
        setEsUsuarioAdmin(true);
      }
      return (gru = [...gru, grupo.gru_id]);
    });

    if (getUsuariosAsignados) {
      setUauriosAsignados(
        getUsuariosAsignados.getUsuariosAsignadosNegociosResolver
      );
    }
    setGrupos(gru);

    if (getConfig) {
      setMonConfig(JSON.parse(getConfig.getConfiguracionResolver));
      setIdMonConfig(JSON.parse(getConfig.getConfiguracionResolver)[0].mon_id);

      if (monIsoBase !== "") {
        switch (monIsoBase) {
          case 1:
            setMonIsoBase("AR$");
            break;
          case 2:
            setMonIsoBase("USD");
            break;
          case 3:
            setMonIsoBase("BRL");
            break;

          default:
            break;
        }
      } else {
        setMonIsoBase(JSON.parse(getConfig.getConfiguracionResolver)[0].mon_id);
      }
    }

    setAutorizado(permisos(gru));

    if (cotizacion) {
      const dolar = Number(
        JSON.parse(cotizacion.fetchCotizacionAPIResolver).dataDolar.venta
      );
      const real = Number(
        JSON.parse(cotizacion.fetchCotizacionAPIResolver).dataReal.venta
      );

      setFechaCotizacion(cotizacion.fetchCotizacionAPIResolver.fecha);

      setCotizacionDolar(dolar);
      setCotizacionReal(real);
    }
    if (
      getGrupoYUsuarios.data &&
      getGrupoYUsuarios.data.getSupervisorYUsuariosResolver
    ) {
      if (getGrupoYUsuarios.data) {
        const info = JSON.parse(
          getGrupoYUsuarios.data.getSupervisorYUsuariosResolver
        );

        if (info && info.dataGrupos && info.dataGrupos.length > 0) {
          const { dataGrupos } = info;
          setListadoGruposDelSupervisor(dataGrupos);

          dataGrupos.map((item) => {
            if (item.gru_id !== 1) {
              setEsUsuarioSupervisor(true);
              setEsUsuarioAdmin(false);
            }
          });
        }

        if (info.dataUsuarios) {
          setListadoUsuariosSupervisados(info.dataUsuarios);
        }
      }
    }
  }, [
    idPipeline,
    getGrupoPorUsuario,
    drawerName,
    getEmbudos,
    negId,
    idEstado,
    filterDate,
    history,
    getGrupo,
    getUsuariosAsignados,
    filterTypeDate,
    autorizado,
    pathname,
    getConfig,
    cotizacion,
    idMonConfig,
    cambioMoneda,
    monIsoBase,
    loading,
    steps,
    allSteps,
  ]);

  const setDrawer = (visible, childrenDrawer) => {
    const drawer = {
      visible,
      childrenDrawer,
    };
    setStateDrawer(drawer);
  };
  const showDrawer = () => {
    setDrawer(true, false);
  };
  const onClose = () => {
    setDrawer(false, false);
  };
  const showChildrenDrawer = () => {
    setDrawer(true, true);
  };
  const onChildrenDrawerClose = () => {
    setDrawer(true, false);
  };

  console.log('version modulo-drawer-deal: 27.08.24') 

  return (
    <DrawerContext.Provider
      value={{
        stateDrawer,
        drawerName,
        drawerDetail,
        newPipelineState,
        drawerNameChildren,
        setDrawerNameChildren,
        setNewPipelineState,
        setDrawerName,
        setDrawerDetail,
        setStateDrawer,
        showDrawer,
        onClose,
        showChildrenDrawer,
        onChildrenDrawerClose,
      }}
    >
      <DealContext.Provider
        value={{
          idUser,
          grupos,
          idPipeline,
          negId,
          etaId,
          etaPreviaId,
          idEstado,
          getEmbudos,
          deal,
          totalProducts,
          products,
          competitors,
          pathname,
          dealCompetitors,
          dealTotalProducts,
          dealProducts,
          notId,
          task,
          view,
          sharedUsers,
          pipelineName,
          cards,
          filterTypeDate,
          usuariosAsignados,
          filterIdUser,
          autorizado,
          filterDate,
          monConfig,
          idMonConfig,
          showFilter,
          cotizacionDolar,
          cotizacionReal,
          fechaCotizacion,
          totalAcumulado,
          porcentajeTotal,
          datosPorEtapa,
          monIsoBase,
          loadingSuma,
          allSteps,
          reloadingApp,
          tagClose,
          tagsList,
          tagsNegId,
          tagsListFilter,
          dealNumber,
          pipeURL, 
          setPipeURL,
          setDealNumber,
          setTagsListFilter,
          setTagsNegId,
          setTagsList,
          setTagClose,
          setAllSteps,
          setDatosPorEtapa,
          setTotalAcumulado,
          setPorcentajeTotal,
          setShowPanelTop,
          setLoadingSuma,
          setReloadingApp,
          setMonIsoBase,
          setCambioMoneda,
          setShowFilter,
          setIdMonConfig,
          setMonConfig,
          setFilterIdUser,
          setIdUser,
          setFilterTypeDate,
          setPipelineName,
          setIdPipeline,
          setSharedUsers,
          setView,
          startPollingEmbudos,
          stopPollingEmbudos,
          setTask,
          setNotId,
          setPathname,
          setDealProducts,
          setDealCompetitors,
          setDealTotalProducts,
          setCompetitors,
          setEtaPreviaId,
          setTotalProducts,
          setProducts,
          setDeal,
          updateEtapaxNegocioResolver,
          newHistorialNegocioResolver,
          setEtaId,
          setNegId,
          setIdEstado,
          setFilterDate,
          setCards,
          etaIdParaForm,
          setEtaIdParaForm,
          etapasFinal,
          setEtapasFinal,
          pipelineSpin,
          setPipelineSpin,
          pipelineFlag,
          setPipelineFlag,
          etapasFlag,
          setEtapasFlag,
          totalNegociosPorEtapa,
          setTotalNegociosPorEtapa,
          listadoUsuariosSupervisados,
          setListadoUsuariosSupervisados,
          esUsuarioSupervisor,
          esUsuarioAdmin,
          listadoGruposDelSupervisor,
          loadingHeader,
          setLoadingHeader,
          clientesParaFiltro,
          setClientesParaFiltro,
          filterCliente,
          setFilterCliente,
          nombreCliFiltrado,
          setNombreCliFiltrado,
          nombreUsuFiltrado,
          setNombreUsuFiltrado,
          pollNegocios,
          setPollNegocios,
          pollValoresEtapa,
          setPollValoresEtapa,
          pollEtapas,
          setPollEtapas,
          listadoClientesMasivo,
          setListadoClientesMasivo,
          masiveTask,
          setMasiveTask,
          usuAsigMasiveTask,
          setUsuAsigMasiveTask,
          pipelineSelected,
          setPipelineSelected,
          estadoSelected,
          setEstadoSelected,
          currentTab,
          setCurrentTab,
          filterDestacadas,
          setFilterDestacadas,
        }}
      >
        <NoteContext.Provider value={{ note, setNote }}>
          <ConfigProvider locale={esES}>
            <span id="main_loader">
              <Layout>
                <Router>
                  <Switch>
                    {/* <Route path={`/funnel`}>
                      <PanelTop
                        totalAcumulado={totalAcumulado}
                        porcentajeTotal={porcentajeTotal}
                        cards={cards}
                        setDrawerName={setDrawerName}
                        setIdPipeline={setIdPipeline}
                        setSteps={setSteps}
                        allSteps={allSteps}
                        steps={steps}
                        idPipeline={idPipeline}
                        history={history}
                        onClickNewPipeline={onClickNewPipeline}
                      />
                      <Graphics
                        totalDeals={cards.length}
                        idPipeline={idPipeline}
                      />
                    </Route>
                    <Route path={`/table`}>
                      <ViewTable setHistory={setHistory} />
                    </Route> */}
                    <Route path="/">
                      <Deal
                        cards={cards}
                        history={history}
                        setHistory={setHistory}
                        steps={steps}
                      />
                    </Route>
                    {/* <Route path="/">
                      <PanelTop
                        totalAcumulado={totalAcumulado}
                        porcentajeTotal={porcentajeTotal}
                        cards={cards}
                        setDrawerName={setDrawerName}
                        setIdPipeline={setIdPipeline}
                        setSteps={setSteps}
                        allSteps={allSteps}
                        steps={steps}
                        idPipeline={idPipeline}
                        history={history}
                        onClickNewPipeline={onClickNewPipeline}
                      /> */}
                      {/* <Pipeline
                        cards={cards}
                        steps={steps}
                        setHistory={setHistory}
                        datosPorEtapa={datosPorEtapa}
                        setDrawerName={setDrawerName}
                        setSteps={setSteps}
                        allSteps={allSteps}
                        history={history}
                      /> */}
                    {/* </Route> */}
                  </Switch>
                </Router>
                <RigthPanel idPipeline={idPipeline} />
              </Layout>
            </span>
          </ConfigProvider>
        </NoteContext.Provider>
      </DealContext.Provider>
    </DrawerContext.Provider>
  );
};

export default App;
