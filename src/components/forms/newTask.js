/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { BellFilled, InboxOutlined } from "@ant-design/icons";
import { useMutation, useQuery } from "@apollo/react-hooks";
import {
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  message,
  Radio,
  Row,
  Select,
  TimePicker,
  Upload,
} from "antd";
import locale from "antd/es/date-picker/locale/es_ES";
import moment from "moment";
import React, { useContext, useEffect, useState } from "react";
import { Fragment } from "react";
import { NEW_TAREA } from "../../Graphql/mutations/tareas";
import { GET_CONTACTOS } from "../../Graphql/queries/clientes";
import { GET_HISTORIAL_POR_NEGOCIO } from "../../Graphql/queries/historial";
import { GET_TIMELINE_POR_NEGOCIO } from "../../Graphql/queries/timeLine";
import { GET_TIPO_TAREA } from "../../Graphql/queries/tipoTarea";
import { setHistorial } from "../../utils/setHistorial";
import { DealContext } from "../context/DealCotext";
import { DrawerContext } from "../context/DrawContext";
import { NoteContext } from "../context/NoteContext";
import Note from "../timeline/components/note/note";
import { GET_USUARIO } from "../../Graphql/queries/usuario";
import { GET_ORIGENES } from "../../Graphql/queries/origenes";

const NewTask = ({ edit }) => {
  const [dateFrom, setDateFrom] = useState("");
  const [timeFrom, settimeFrom] = useState("");
  const [priority, setPriority] = useState(1);
  const [origenes, setOrigenes] = useState([]);
  const [form] = Form.useForm();
  const { Option } = Select;
  const [notification, setNotification] = useState(false);
  const { note, setNote } = useContext(NoteContext);
  const { negId, deal, newHistorialNegocioResolver, etaId, task, idUser } =
    useContext(DealContext);
  const { onClose } = useContext(DrawerContext);
  const [searchUser, setSearchUser] = useState("");

  const [newTareaResolver] = useMutation(NEW_TAREA, {
    refetchQueries: [
      { query: GET_HISTORIAL_POR_NEGOCIO, variables: { idNegocio: negId } },
      { query: GET_TIMELINE_POR_NEGOCIO, variables: { idNegocio: negId } },
    ],
  });
  const { data, loading } = useQuery(GET_TIPO_TAREA, {
    variables: { idCategoria: 1 },
  });
  const { data: dataOrigenes } = useQuery(GET_ORIGENES);
  const [contactos, setContactos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const getUsuarios = useQuery(GET_USUARIO, {
    variables: { input: searchUser },
  });
  const { Dragger } = Upload;
  const [disabledDragger] = useState(false);
  const [file, setFile] = useState({});
  const [fList, setFlist] = useState([]);

  const getContactos = useQuery(GET_CONTACTOS, {
    variables: { id: deal.cli_id },
  });

  const PORT = "4001";
  const PROTOCOL = window.location.protocol;
  const HOSTNAME = window.location.hostname;
  const URL = `${PROTOCOL}//${HOSTNAME}:${PORT}`;

  // useEffect(() => {
  // 	if (Object.keys(task).length) {
  // 	} else {
  // 	}
  // }, [task]);

  const props = {
    name: "archivo",
    multiple: false,
    uploaded: false,
    action: `${URL}/files`,
    fileList: fList,
    onChange(info) {
      setFlist(info.fileList.slice(-1));
      const { response, status } = info.file;

      setFile(response);

      if (status !== "uploading") {
      }
      if (status === "done") {
        message.success(
          `${info.file.name} El archivo se adjuntó correctamente.`
        );
      } else if (status === "error") {
        message.error(`${info.file.name} Error al cargar el archivo.`);
      }
    },
    onRemove(info) {
      const { status } = info;

      if (status === "done") {
        message.success(`${info.name} El archivo se eliminó correctamente.`);
        setFlist([]);
      }
    },
  };

  // if (loading) return '';
  useEffect(() => {
    if (getContactos.data) {
      const { getContactosResolver } = getContactos.data;
      setContactos(getContactosResolver);
    }
    if (getUsuarios.data) {
      const { getUsuariosResolver } = getUsuarios.data;
      setUsuarios(getUsuariosResolver);
    }
    if (dataOrigenes) {
      setOrigenes(dataOrigenes.getOrigenesResolver);
    }
  }, [searchUser, getContactos, usuarios]);
  // setContacts(getContactos.data.getContactosResolver);

  const onFinish = (v) => {
    let inputAdjunto;

    const fechaVencimientoDefault = moment(v.tar_fecha._d).format("YYYY-MM-DD");
    const horaVencimientoDefault = moment(v.tar_horavencimiento._d).format(
      "HH:mm"
    );

    if (Object.keys(file).length) {
      const extension = file.originalname.split(".")[1];
      inputAdjunto = {
        up_filename: file.fileName,
        up_mimetype: extension,
        up_hashname: file.filename,
        usu_id: 1,
        up_detalle: v.adj_detalle,
        up_size: String(file.size),
      };
    }

    const inputTarea = {
      tar_asunto: v.tar_asunto,
      tar_vencimiento: dateFrom || fechaVencimientoDefault,
      tar_horavencimiento: timeFrom || horaVencimientoDefault,
      est_id: 1,
      usu_id: v.usu_asig_id ? v.usu_asig_id : deal.usu_asig_id,
      cli_id: deal.cli_id,
      ale_id: Number(v.ale_id),
      tar_alertanum: Number(v.tar_alertanum),
      tip_id: Number(v.tip_id),
      pri_id: priority,
      ori_id: v.fuente,
    };

    let inputNota = {
      not_desc: note === `<p><br></p>` ? "" : note,
      not_importancia: priority,
    };

    if (inputNota.not_desc === "") {
      inputNota = null;
    }

    if (fList.length === 0) {
      inputAdjunto = null;
    }

    newTareaResolver({
      variables: {
        idNegocio: negId,
        idUsuario: idUser,
        idCliente: deal.cli_id,
        idContacto: Number(v.con_id),
        inputTarea,
        inputNota,
        inputAdjunto,
        idUsuarioAsignado: v.usu_asig_id ? v.usu_asig_id : deal.usu_asig_id,
      },
    }).then((tarea) => {
      const idTarea = tarea.data.newTareaResolver;
      const template = `####T_${idTarea}`;
      const his_detalle = template;
      setHistorial(
        newHistorialNegocioResolver,
        idUser,
        negId,
        Number(etaId),
        his_detalle,
        -1
      );
    });

    setNote("");
    form.resetFields();
    setFlist([]);
    onClose();
  };

  const handleChange = () => {};

  const onChangeDateFrom = (v, d) => {
    setDateFrom(moment(v._d).format("YYYY-MM-DD"));
  };
  const onChangeTimeFrom = (v, d) => {
    settimeFrom(moment(v._d).format("HH:mm"));
  };

  const onChangePriority = (v) => {
    setPriority(Number(v.target.value));
  };
  const handleChangeContact = () => {};

  const onSearchUser = (val) => {
    if (val.length >= 3) {
      setSearchUser(val.toLowerCase());
    }
  };

  return (
    <Row gutter={[20, 20]}>
      <Col xs={24}>
        <Fragment>
          {!edit && (
            <Form
              form={form}
              requiredMark="optional"
              name="etapas"
              layout="vertical"
              onFinish={onFinish}
              autoComplete="off"
            >
              <Form.Item
                label="Asunto"
                name="tar_asunto"
                rules={[
                  {
                    required: true,
                    message: "Campo obligatorio",
                  },
                ]}
              >
                <Input.TextArea />
              </Form.Item>
              <Form.Item
                label="Tipo de tarea"
                name="tip_id"
                rules={[
                  {
                    required: true,
                    message: "Campo obligatorio",
                  },
                ]}
              >
                {data && (
                  <Select onChange={handleChange}>
                    {data.getTiposTareaResolver.map((item) => {
                      return (
                        <Option key={item.tip_id} value={item.tip_id}>
                          {item.tip_desc}
                        </Option>
                      );
                    })}
                  </Select>
                )}
              </Form.Item>
              <Form.Item
                label="Fuente"
                name="fuente"
                rules={[
                  {
                    required: true,
                    message: "",
                  },
                ]}
              >
                <Select>
                  {origenes &&
                    origenes.map((item) => {
                      return (
                        <Select.Option key={item.ori_id} value={item.ori_id}>
                          {item.ori_desc}
                        </Select.Option>
                      );
                    })}
                </Select>
              </Form.Item>
              {getContactos.data && (
                <Form.Item label="Contacto" name="con_id">
                  <Select
                    onChange={handleChangeContact}
                    disabled={
                      getContactos.data.getContactosResolver.length > 0
                        ? false
                        : true
                    }
                  >
                    {getContactos.data.getContactosResolver.map((item) => {
                      const { con_id, con_nombre } = item;

                      return (
                        <Option key={con_id} value={con_id}>
                          {con_nombre}
                        </Option>
                      );
                    })}
                  </Select>
                </Form.Item>
              )}

              <Row>
                <Col xs={24}>
                  <div className="date_wrapper">
                    <Col xs={7}>
                      <Form.Item
                        initialValue={moment(new Date(), "YYYY-MM-DD")}
                        label="Vencimiento"
                        name="tar_fecha"
                        rules={[
                          {
                            required: true,
                            message: "Campo obligatorio",
                          },
                        ]}
                      >
                        <DatePicker
                          disabledDate={(current) =>
                            current.isBefore(moment().subtract(1, "day"))
                          }
                          style={{ width: "97%", marginRight: 4 }}
                          locale={locale}
                          format="DD/MM/YYYY"
                          onChange={onChangeDateFrom}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={5}>
                      <Form.Item
                        label="Hora"
                        initialValue={moment(new Date(), "YYYY-MM-DD")}
                        name="tar_horavencimiento"
                        rules={[
                          {
                            required: true,
                            message: "Campo obligatorio",
                          },
                        ]}
                      >
                        <TimePicker
                          style={{ width: 150 }}
                          locale={locale}
                          format="HH:mm"
                          use12Hours={false}
                          onChange={onChangeTimeFrom}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={11}>
                      <div
                        className={
                          notification ? `bell_button act` : `bell_button`
                        }
                        onClick={() => setNotification(!notification)}
                      >
                        <BellFilled style={{ marginLeft: 15 }} />
                      </div>
                    </Col>
                  </div>
                  <div
                    className={
                      notification
                        ? `container_notification open`
                        : `container_notification`
                    }
                  >
                    <h3 className="notification_title">
                      Envío de alerta por correo
                    </h3>
                    <Row
                      gutter={[10, 10]}
                      align="middle"
                      //  style={{ marginTop: 15 }}
                      justify="start"
                    >
                      <Col xs={4}>
                        <Form.Item name="ale_id" initialValue="10">
                          <Input
                            type="number"
                            min={0}
                            max={24}
                            placeholder="30"
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={7}>
                        <Form.Item name="tar_alertanum" initialValue="1">
                          <Select onChange={handleChange} placeholder="Minutos">
                            <Option value="1">Minutos</Option>
                            <Option value="2">Horas</Option>
                            <Option value="3">Días</Option>
                          </Select>
                        </Form.Item>
                      </Col>
                    </Row>
                  </div>
                </Col>
              </Row>

              <Form.Item name="not_desc">
                <Note></Note>
                <Row gutter={[20, 20]}>
                  <Col sm={24}>
                    <Radio.Group
                      defaultValue="1"
                      buttonStyle="solid"
                      onChange={onChangePriority}
                    >
                      <Radio.Button value="1">Alta</Radio.Button>
                      <Radio.Button value="2">Media</Radio.Button>
                      <Radio.Button value="3">Baja</Radio.Button>
                    </Radio.Group>
                  </Col>
                </Row>
              </Form.Item>
              <Form.Item label="Detalle" name="adj_detalle">
                <Input
                  placeholder="Descripción de archivo"
                  style={{ width: "100%" }}
                />
              </Form.Item>
              <Form.Item name="up_detalle">
                <Dragger
                  {...props}
                  disabled={disabledDragger}
                  style={{ marginBottom: "1rem" }}
                >
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                  </p>
                  <p className="ant-upload-text">
                    Click o arrastrar a esta área para subir un archivo
                  </p>
                  <p className="ant-upload-hint">
                    Los tipos de archivos son PDF, JPEG, PNG, SVG
                  </p>
                </Dragger>
              </Form.Item>
              <Row gutter={[8, 8]}>
                <Col xs={24}>
                  <Form.Item name="usu_asig_id" label="Asignar a usuario">
                    {/* <Input prefix={<UserOutlined />} size="middle" placeholder="" /> */}
                    <Select
                      // mode="multiple"
                      // disabled={usuarios.length > 0 ? false : true}
                      showSearch
                      placeholder="Usuario"
                      optionFilterProp="children"
                      defaultValue={deal && deal.usu_asig_id}
                      // onChange={onChangeUser}
                      // onFocus={onFocus}
                      // onBlur={onBlur}
                      onSearch={onSearchUser}
                      loading={usuarios === null ? true : false}
                      filterOption={(input, option) =>
                        option.props.children
                          .toLowerCase()
                          .indexOf(input.toLowerCase()) >= 0
                      }
                    >
                      {usuarios &&
                        usuarios.map((usuario) => {
                          const { usu_id, usu_nombre } = usuario;
                          return (
                            <Option key={usu_id} value={usu_id}>
                              {usu_nombre}
                            </Option>
                          );
                        })}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item>
                <Button type="primary" block htmlType="submit">
                  Guardar
                </Button>
              </Form.Item>
            </Form>
          )}
        </Fragment>
      </Col>
    </Row>
  );
};

export default NewTask;
