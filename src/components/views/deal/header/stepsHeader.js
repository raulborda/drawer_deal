/* eslint-disable array-callback-return */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { StopOutlined, SwapOutlined } from "@ant-design/icons";
import { useMutation, useQuery } from "@apollo/react-hooks";
import { Tooltip } from "antd";
import React, { Fragment, useContext, useEffect, useState } from "react";
import { NEW_HISTORIAL_NEGOCIO } from "../../../../Graphql/mutations/historial";
import { setHistorial } from "../../../../utils/setHistorial";
import { DealContext } from "../../../context/DealCotext";
import OpenNotification from "../../../notifications/openNotification";
import { GET_TIEMPO_ETAPA_POR_NEGOCIO } from "../../../../Graphql/queries/historial";
import { timeDiff } from "../../../../utils/timeDiff";
import moment from "moment";
import { GET_ETAPAS_POR_ID } from "../../../../Graphql/queries/etapas";

const StepsHeader = ({
  data,
  etaIdNegocio,
  setEtaNombre,
  etapasFinal,
  stateGonzalo,
}) => {
  const {
    idUser,
    getEtapasSuma,
    deal,
    setDeal,
    setEtaId,
    etaId,
    etaPreviaId,
    setEtaPreviaId,
    updateEtapaxNegocioResolver,
    negId,
    allSteps,
    pipeURL,
    setPipeURL,
    idPipeline,
    esUsuarioAdmin,
  } = useContext(DealContext);

  const [hover, setHover] = useState();
  const [days, setDays] = useState([]);
  const [etapas, setEtapas] = useState([]);

  const {
    data: etapasPorId,
    startPolling: startEtaPolling,
    stopPolling: stopEtaPolling,
  } = useQuery(GET_ETAPAS_POR_ID, {
    variables: { id: pipeURL },
    //pollInterval: 500,
  });

  useEffect(() => {
    if (etapasPorId) {
      setEtapas(etapasPorId.getEtapaPorIdResolver);
    }
  }, [etapasPorId]);

  const [newHistorialNegocioResolver] = useMutation(NEW_HISTORIAL_NEGOCIO);
  const {
    data: dato,
    startPolling: startTiempoPorEtapa,
    stopPolling: stopTiempoPorEtapa,
  } = useQuery(GET_TIEMPO_ETAPA_POR_NEGOCIO, {
    variables: { idNegocio: negId },
    pollInterval: 2000,
  });

  useEffect(() => {
    // getEtapasSuma.stopPolling();
    if (!data) return;
    // test();

    if (dato) {
      // diffDayInStages();
    }
    stopTiempoPorEtapa();
  }, [getEtapasSuma, dato, data]);

  const onHover = (item) => {
    setHover(item);
  };

  const onLeave = () => {
    setHover(0);
  };
  const onClick = (item) => {
    if (Number(item) === deal.eta_id) return;

    if (deal.neg_estado > 0) {
      // Emite notificación.
      OpenNotification(
        <h3>Negocio cerrado</h3>,
        <span>No podrá mover este negocio.</span>,
        "topleft",
        <StopOutlined style={{ color: "red" }} />,
        null
      );
      return;
    }
    if (deal.usu_asig_id !== idUser && !esUsuarioAdmin) {
      // Emite notificación.
      OpenNotification(
        <h3>Operación no permitida</h3>,
        <span>No podrás mover este negocio porque no lo has creado.</span>,
        "topleft",
        <StopOutlined style={{ color: "red" }} />,
        null
      );
      return;
    }

    let etaNombre = etapas.map((etapa) => {
      if (Number(item) === Number(etapa.eta_id)) {
        return etapa.eta_nombre;
      }
    });

    OpenNotification(
      <h3>Cambio de etapa</h3>,
      <span>El negocio se ha movido a {etaNombre} </span>,
      "topleft",
      <SwapOutlined style={{ color: "#00b33c" }} />,
      null
    );

    // revisar data que se envia
    const negocio = {
      eta_id: Number(item),
      neg_id: negId,
    };

    setDeal({ ...deal, eta_id: Number(item) });

    setEtaId(Number(item));
    updateEtapaxNegocioResolver({ variables: { input: negocio } }).then(() => {
      // getEtapasSuma.startPolling();
      // startPolling(500);
      // startTiempoPorEtapa(500);
    });
    // .catch((error) =>

    //setea  los cambios en el Historial
    setEtaId(Number(item));
    if (etaPreviaId === null) {
      setEtaPreviaId(Number(item));
    } else {
      setEtaPreviaId(Number(etaIdNegocio));
    }

    const prev = Number(etaIdNegocio);
    const et = Number(item);

    //*ORIGINAL USA allSteps
    // const etaPrevia = allSteps.filter((etapa) => {
    //   return Number(etapa.eta_id) === prev;
    // })[0].eta_nombre;

    //se busca el nombre de la etapa previa en el array.

    const etaPrevia = etapas.filter((etapa) => {
      return Number(etapa.eta_id) === prev;
    })[0].eta_nombre;

    // Se busca el nombre de la etapa en el array
    const etapa = etapas.filter((etapa) => {
      return Number(etapa.eta_id) === et;
    })[0].eta_nombre;

    const template = `Cambio de etapa desde ${etaPrevia} hacia ${etapa}`;
    setHistorial(
      newHistorialNegocioResolver,
      idUser,
      negId,
      Number(item),
      template,
      Number(etaIdNegocio)
    );
  };

  const daysDiff = (item) => {
    if (!days) return;
    let dias;
    const d = days.find((days) => {
      return days.his_etaprevia === Number(item.eta_id);
    });

    if (d) {
      dias = d.daysInStage;
    } else {
      dias = 0;
    }

    return (
      <>
        {days && (
          <span className="dias">
            {/* {`${dias} ${dias === 1 ? `día` : `días`} `} */}
          </span>
        )}
      </>
    );
  };

  const diffDayInStages = () => {
    if (dato.getTiempoEtapaByNegocioResolver.length < 1) return;
    let diff;
    let update;

    const dateDiff = allSteps.map((etapa, i) => {
      //ETAPA ACTIVA
      if (Number(etapa.eta_id) === Number(etaId)) {
        const apariciones = dato.getTiempoEtapaByNegocioResolver.filter(
          (x) => x.eta_id === Number(etapa.eta_id)
        );

        let sum = 0;
        let fechas = [];
        apariciones.forEach((v, index) => {
          sum += Number(v.tiempo);
          fechas = [
            ...fechas,
            {
              fechaPrevia: v.his_fechaprevia,
              fechaUpdate:
                index + 1 === apariciones.length ? null : v.his_fechaupdate,
            },
          ];
        });
        if (etapa.his_etaprevia === 0) {
          return "";
        }
        const ultimaFecha = apariciones[apariciones.length - 1].his_fechaupdate;

        let dif = Math.abs(timeDiff(Date.now(), Number(ultimaFecha)));
        let total = sum + Number(dif);

        diff = {
          daysInStage: total,
          index: etaId,
          his_etaprevia: Number(etapa.eta_id),
          fechas_desde_hasta: fechas,
        };

        return diff;
      }
      //EL RESTO DE LAS ETAPAS
      else {
        const apariciones = dato.getTiempoEtapaByNegocioResolver.filter(
          (x) => x.his_etaprevia === Number(etapa.eta_id)
        );
        if (apariciones[apariciones.length - 1]) {
          update = Number(apariciones[apariciones.length - 1].his_fechaupdate);
        }
        let sum = 0;
        let fechas = [];
        apariciones.forEach((v, i) => {
          sum += Number(v.tiempo);
          fechas = [
            ...fechas,
            {
              fechaPrevia: v.his_fechaprevia,
              fechaUpdate: v.his_fechaupdate,
            },
          ];
        });

        let acumulado = 0;
        if (fechas.length > 0) {
          acumulado = timeDiff(Date.now(), Number(update));
        }

        let total = sum + Number(acumulado);

        diff = {
          daysInStage: total,
          index: etaId,
          his_etaprevia: Number(etapa.eta_id),
          fechas_desde_hasta: fechas,
        };
      }
      return diff;
    });

    setDays(dateDiff);
  };

  const info = (item) => {
    const { eta_diasinactivos, eta_id, eta_nombre } = item;

    const fdh = days.find((fechas) => fechas.his_etaprevia === Number(eta_id));

    return (
      <Fragment>
        <div className="tooltip_wrapper">
          <h3>{eta_nombre}</h3>

          {fdh && (
            // const { fechaPrevia, fechaUpdate } = fechas;
            <ul>{fechasDesdeHastaComponent(fdh.fechas_desde_hasta)}</ul>
          )}
        </div>
      </Fragment>
    );
  };

  const fechasDesdeHastaComponent = (fechas) => {
    return (
      <Fragment>
        {fechas.length > 0 &&
          fechas.map((fecha, i) => {
            const { fechaPrevia, fechaUpdate } = fecha;

            return (
              <li key={fechaPrevia + i}>
                <span className="text_bold">Desde: </span>
                <span>
                  {moment(new Date(Number(fechaPrevia))).format("DD/MM/YYYY")}
                </span>
                {fechaUpdate !== null && (
                  <>
                    <span className="text_bold"> hasta: </span>
                    <span>
                      {moment(new Date(Number(fechaUpdate))).format(
                        "DD/MM/YYYY"
                      )}
                    </span>
                  </>
                )}
              </li>
            );
          })}
      </Fragment>
    );
  };

  return (
    <Fragment>
      <div className="header_steps_wrapper">
        {etapas &&
          etapas.map((item) => {
            if (Number(etaId) === Number(item.eta_id)) {
              setEtaNombre(item.eta_nombre);
              // console.log(item.eta_nombre)
            }

            return (
              <Tooltip
                key={item.eta_id}
                placement="bottom"
                overlayClassName="tooltip_wrapper"
                title={() => info(item)}
              >
                <div
                  className={
                    etaIdNegocio >= item.eta_id
                      ? `header_steps activeStep`
                      : `header_steps` && hover >= item.eta_id
                      ? `header_steps activeStep`
                      : `header_steps`
                  }
                  onMouseEnter={() => {
                    onHover(item.eta_orden);
                  }}
                  onMouseLeave={() => {
                    onLeave();
                  }}
                  onClick={() => {
                    onClick(item.eta_id);
                  }}
                >
                  {daysDiff(item)}
                  {/* <span
                    className={
                      etaId >= item.eta_id
                        ? `arrow activeStep`
                        : `arrow` && hover >= item.eta_id
                        ? `arrow activeStep`
                        : `arrow`
                    }
                  ></span> */}
                </div>
              </Tooltip>
            );
          })}
      </div>
    </Fragment>
  );
};

export default StepsHeader;
