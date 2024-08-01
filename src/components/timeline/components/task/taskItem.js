/* eslint-disable no-unused-vars */
import {
  CheckOutlined,
  DeleteOutlined,
  EditOutlined,
  FileDoneOutlined,
  PushpinOutlined,
  ShopOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useMutation } from "@apollo/client";
import { Button, Popconfirm } from "antd";
import moment from "moment";
import React, { Fragment, useContext } from "react";
import {
  TAREA_ANCLADA,
  UPDATE_ESTADO_TAREA,
  TAREA_ARCHIVADA,
} from "../../../../Graphql/mutations/tareas";
import { DrawerContext } from "../../../context/DrawContext";
import NoteItem from "../note/noteItem";
import UploadItem from "../upload/uploadItem";
import { DealContext } from "../../../context/DealCotext";
import TaskClose from "./taskClose";
import { setHistorial } from "../../../../utils/setHistorial";
import TaskCompleted from "./taskCompleted";

const TaskItem = ({ task, note, upload, taskStatus }) => {
  //
  const [tareaAncladaResolver] = useMutation(TAREA_ANCLADA);
  const [tareaArchivadaResolver] = useMutation(TAREA_ARCHIVADA);

  const { showDrawer, setDrawerName } = useContext(DrawerContext);
  const { setTask, newHistorialNegocioResolver, negId, idUser } =
    useContext(DealContext);
  let uploadFile;
  let estado = task.tar_anclado;
  const {
    tar_vencimiento,
    tar_horavencimiento,
    his_fechaupdate,
    cli_nombre,
    tip_desc,
    not_id,
    tar_anclado,
    tar_asunto,
    tar_fecha_ts,
    tar_id,
    up_id,
    usu_nombre,
    con_nombre,
    usuarioAsignado
  } = task;
  //
  const [estadoTareaResolver] = useMutation(UPDATE_ESTADO_TAREA);
  if (upload) {
    uploadFile = { ...upload, cli_nombre };
  }

  //startPolling(500);
  //start_Polling_Historial(500);

  const onAnchor = (id, anclado) => {
    let estado;
    if (anclado === 0) {
      estado = 1;
    } else {
      estado = 0;
    }

    tareaAncladaResolver({ variables: { idTarea: id, anclado: estado } });
  };

  const onEdit = (id, task) => {
    //
    let taskitem = {};

    // La tarea tiene nota?
    if (task.not_id !== null && task.up_id === null) {
      //
    }

    // La tarea tiene adjunto?
    if (task.up_id !== null) {
      //
    }

    // La tarea tiene nota y adjunto

    if (task.not_id !== null && task.up_id !== null) {
      //	la tarea tiene nota y adjunto
    }
    setDrawerName("Editar Tarea");
    showDrawer();
    setTask(task);
  };

  const onCompleted = (idTask, task) => {
    //
    estadoTareaResolver({ variables: { idTarea: idTask, idEstado: 2 } });
  };

  const onArchive = (tar_id, tar_asunto) => {
    //
    tareaArchivadaResolver({ variables: { idTarea: tar_id } }).then((data) => {
      //
      setHistorial(
        newHistorialNegocioResolver,
        idUser,
        negId,
        0,
        `Tarea eliminada: ${tar_asunto}`,
        -1
      );
    });
  };

  const onShowControlls = () => {
    //
    switch (true) {
      case task.est_id === 1 && task.tar_anclado === 1:
        return controlls();
      case taskStatus === 1 && task.tar_anclado === 0:
        return controlls();

      default:
        //
        return "";
    }
  };

  const controlls = () => (
    <div className="task_anchor">
      <Button type="link" onClick={() => onAnchor(tar_id, tar_anclado)}>
        <PushpinOutlined
          className={tar_anclado === 1 ? `anchor` : `unanchor`}
        />
      </Button>
      <Button
        type="link"
        style={{ padding: 5 }}
        onClick={() => onEdit(tar_id, task)}
      >
        <EditOutlined />
      </Button>
      <Popconfirm
        style={{ width: 200 }}
        title="¿Deseas marcar como completada esta tarea?"
        okText="Completar tarea"
        cancelText="Cerrar"
        onConfirm={() => onCompleted(tar_id)}
        placement="left"
      >
        <Button type="link">
          <CheckOutlined style={{ color: "#00b33c" }} />
        </Button>
      </Popconfirm>
      <Popconfirm
        style={{ width: 200 }}
        title="¿Deseas eliminar esta tarea?"
        okText="Eliminar"
        cancelText="Cerrar"
        onConfirm={() => onArchive(tar_id, tar_asunto)}
        placement="left"
      >
        <Button type="link">
          <DeleteOutlined style={{ color: "red" }} />
        </Button>
      </Popconfirm>
    </div>
  );

  return (
    <Fragment>
      <div className="task_wrapper">
        <div className="task_header">
          <div className="task_title">
            {tar_asunto}

            {onShowControlls()}
          </div>
          <div className="task_info_wrapper">
            <div className="task_info">
              <span className="task_date">
                {moment(tar_fecha_ts).startOf("seconds").fromNow()}
              </span>
              <span className="task_author">{usuarioAsignado}</span>
              <div className="task_business">
                <ShopOutlined style={{ marginRight: 4 }} />
                {cli_nombre}
              </div>
              {con_nombre && (
                <div className="task_contact">
                  <UserOutlined style={{ marginRight: 4 }} />
                  {con_nombre}
                </div>
              )}
              <div className="task_business">
                <FileDoneOutlined
                  style={{ marginRight: 4, color: "#00b33c" }}
                />
                <span style={{ color: "#00b33c" }}>{tip_desc}</span>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <TaskClose
                tar_horavencimiento={tar_horavencimiento}
                tar_vencimiento={tar_vencimiento}
                taskStatus={taskStatus}
                task={task}
                his_fechaupdate={his_fechaupdate}
              ></TaskClose>
              <TaskCompleted
                his_fechaupdate={his_fechaupdate}
                taskStatus={taskStatus}
                task={task}
              />
            </div>
          </div>
        </div>
      </div>

      {note.not_desc && (
        <Fragment>
          <NoteItem note={note} attached key={not_id} />
        </Fragment>
      )}
      {upload && (
        <Fragment>
          <UploadItem upload={uploadFile} attached key={up_id} />
        </Fragment>
      )}
    </Fragment>
  );
};

export default TaskItem;
