/* eslint-disable react-hooks/exhaustive-deps */
import {
  DeleteOutlined,
  FilePdfOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useLazyQuery, useMutation, useQuery } from "@apollo/client";
import {
  Button,
  Col,
  ConfigProvider,
  Empty,
  Form,
  Popconfirm,
  Row,
  Select,
  Table,
  InputNumber,
  message,
} from "antd";
import React, {
  Fragment,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { NEW_PRODUCTO_NEGOCIO } from "../../Graphql/mutations/productos";
import { GET_PRODUCTOS_LIMIT } from "../../Graphql/queries/productos";
import { setHistorial } from "../../utils/setHistorial";
import { DealContext } from "../context/DealCotext";
import { DrawerContext } from "../context/DrawContext";

import { getPDFHeaderData } from "../../Graphql/queries/pdfHeader";

const AddProduct = () => {
  const PROTOCOL = window.location.protocol;
  const HOSTNAME = window.location.hostname;

  const PDFEXPORT = `${PROTOCOL}//${HOSTNAME}:${1400}/pdfExport`;

  // const [products, setProducts] = useState([]);
  const Option = Select.Option;
  const [form] = Form.useForm();
  const [searchProduct, setSearchProduct] = useState("");

  const [productList, setProductList] = useState([]);
  const [prodIdList, setProdIdList] = useState([]);

  const { onChildrenDrawerClose, onClose } = useContext(DrawerContext);
  const {
    newHistorialNegocioResolver,
    products,
    setProducts,
    pathname,
    deal,
    negId,
    idUser,
    totalProducts,
    setTotalProducts,
    dealProducts,
    setDealProducts,
  } = useContext(DealContext);
  const selectProducto = useRef();

  const [getProductLimit, { data }] = useLazyQuery(GET_PRODUCTOS_LIMIT, {
    // fetchPolicy: 'network-only',
  });
  const [newProductoXNegocioResolver] = useMutation(NEW_PRODUCTO_NEGOCIO);

  useEffect(() => {
    // if (!data) return;

    let prods;
    if (dealProducts) {
      prods = dealProducts.map((item) => ({ prod_id: item.prod_id }));

      setProdIdList(prods);
    }
    if (data) {
      setProductList(data.getProductosLimitResolver);
    }
    if (!data && prodIdList.length === 0) {
      getProductLimit({
        variables: {
          input: searchProduct,
          listaProductosElegidos: {
            listadoProductos: prods,
            // listadoProductos: ,
          },
        },
      });
    }

    // setDealProducts(products);
  }, [products, totalProducts, searchProduct, data, dealProducts]);

  const empty = () => {
    return (
      <Empty
        // image="../../assets/empty.svg"
        imageStyle={{
          height: 60,
          color: "red",
        }}
        description={<span>Producto inexistente</span>}
      >
        {/* <Button type="primary">Create Now</Button> */}
      </Empty>
    );
  };

  function onBlur() {}

  function onFocus() {
    getProductLimit({
      variables: {
        input: searchProduct,
        listaProductosElegidos: {
          listadoProductos: prodIdList,
          // listadoProductos: ,
        },
      },
    });
  }

  function onSearch(val) {
    if (val.length > 3) {
      //

      setSearchProduct(val);

      getProductLimit({
        variables: {
          input: val,
          listaProductosElegidos: {
            listadoProductos: prodIdList,
            // listadoProductos: ,
          },
        },
      });
    }
  }

  const handleDelete = (key) => {
    const prod = products ? products : dealProducts;
    let eliminado;

    const item = prod.filter((item) => {
      if (Number(item.prod_id) === Number(key.prod_id)) {
        eliminado = item;
      }

      return item.prod_id !== key.prod_id;
    });

    // if (pathname === "/negocio") {
    //   // if (dealProducts.length === 1) {
    //   // 	setDealTotalProducts(0);
    //   // }
    //   setDealTotalProducts(dealTotalProducts - eliminado.total);
    //   setDealProducts(item);
    // } else {
    if (products.length === 1) {
      setTotalProducts(0);
    }
    setTotalProducts(totalProducts - eliminado.total);
    setProducts(item);
    // }
  };

  const onFinish = (values) => {
    setProdIdList([...prodIdList, { prod_id: Number(values.prod_id) }]);

    getProductLimit({
      variables: {
        input: searchProduct,
        listadoProductosElegidos: {
          listadoProductos: [
            ...prodIdList,
            { prod_id: Number(values.prod_id) },
          ],
        },
      },
    });

    const productoElegido = productList.filter(
      (x) => x.prod_id === values.prod_id
    );

    const nombreProductoElegido = productoElegido[0].prod_desc;

    // var prod = selectProducto.current.props.children.filter((product) => {
    //   return product.props.value === values.prod_id;
    // });

    // let index = 0;
    // if (products.length > 0) {
    // 	index = products.length;
    // }

    const product = {
      ...values,
      prod_id: values.prod_id,
      prod_desc: nombreProductoElegido,
      key: values.prod_id,
      total: Number(values.cantidad) * Number(values.valor),
    };

    setProducts([...products, product]);
    setTotalProducts(totalProducts + product.total);

    // if (pathname === "/") {
    //   setProducts([...products, product]);
    //   setTotalProducts(totalProducts + product.total);
    // } else {
    //   setDealProducts([...dealProducts, product]);
    //   setDealTotalProducts(dealTotalProducts + product.total);
    // }

    form.resetFields();
    setSearchProduct("");
  };

  // Componente Tabla Ant
  const columns = [
    {
      title: "Producto",
      dataIndex: "prod_desc",
      key: "prod_id",
      responsive: ["xs", "sm", "md", "lg", "xl", "xxl"],
    },
    {
      title: "Cantidad",
      dataIndex: "cantidad",
      key: "cantidad",
      align: "right",
      responsive: ["xs", "sm", "md", "lg", "xl", "xxl"],
    },
    {
      title: "Valor",
      dataIndex: "valor",
      key: "valor",
      align: "right",
      responsive: ["xs", "sm", "md", "lg", "xl", "xxl"],
      render: (text, record) => {
        return (
          <span>
            {deal.mon_iso}{" "}
            {Number(record.valor).toLocaleString("de-DE", {
              maximumFractionDigits: 2,
            })}
          </span>
        );
      },
    },
    {
      title: "Total",
      dataIndex: "total",
      key: "total",
      align: "right",
      responsive: ["xs", "sm", "md", "lg", "xl", "xxl"],
      render: (text, record) => {
        return (
          <span>
            {deal.mon_iso}{" "}
            {Number(record.cantidad * record.valor).toLocaleString("de-DE", {
              maximumFractionDigits: 2,
            })}
          </span>
        );
      },
    },
    {
      title: "...",
      responsive: ["xs", "sm", "md", "lg", "xl", "xxl"],
      dataIndex: "borrar",
      align: "center",
      render: (text, record) => (
        <Popconfirm
          title="¿Deseas eliminar el producto?"
          // style={{ width: 300 }}
          okText="Borrar"
          placement="right"
          cancelText="Cerrar"
          onConfirm={() => handleDelete(record)}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Button type="link">
              <DeleteOutlined />
            </Button>
          </div>
        </Popconfirm>
      ),
    },
  ];

  const onChangeSelect = () => {};

  const saveProducts = () => {
    let description;

    if (products.length > 0) {
      const listadoProductos = products.map((item) => {
        let { prod_id, valor, cantidad } = item;
        const cant = Number(cantidad);
        const val = Number(valor);
        const prodId = Number(prod_id);

        let producto = {
          prod_id: prodId,
          valor: val,
          cantidad: cant,
          // neg_id: negId,
        };
        return producto;
      });
      setProducts([...products]);

      newProductoXNegocioResolver({
        variables: {
          input: { productoXNegIndividual: listadoProductos },
          idNegocio: Number(negId),
        },
      });
      if (products.length >= 1) {
        description =
          products.length > 1
            ? `Se agregaron productos: El negocio tiene ${products.length} productos`
            : `Se agrega un producto`;
      }
      if (dealProducts.length >= 1) {
        description =
          dealProducts.length > 1
            ? `Se agregaron productos: El negocio tiene ${dealProducts.length} productos`
            : `Se agrega un producto`;
      }

      setHistorial(
        newHistorialNegocioResolver,
        idUser,
        negId,
        deal.eta_id,
        description,
        -1
      );
    } else {
      newProductoXNegocioResolver({
        variables: { input: { productoXNegIndividual: [] }, idNegocio: negId },
      });

      setHistorial(
        newHistorialNegocioResolver,
        idUser,
        negId,
        deal.eta_id,
        "Se eliminaron los productos",
        -1
      );
    }
    onClose();
  };

  return (
    <Fragment>
      <ConfigProvider renderEmpty={empty}>
        <div className="layout-wrapper">
          {/* <span className="print-sheet">
            <Popconfirm
              icon={null}
              placement="leftTop"
              title="¿Desea exportar a PDF?"
              okText="Si"
              onConfirm={onConfirmPDF}
              cancelText="No"
            >
              <FilePdfOutlined style={{ color: "red" }} />
            </Popconfirm>
          </span> */}
          <div className="layout-form">
            <Form
              name="products"
              form={form}
              onFinish={onFinish}
              autoComplete="off"
            >
              <Row align="middle" justify="space-between" gutter={[5, 5]}>
                <Col xs={10}>
                  <Form.Item
                    name="prod_id"
                    rules={[{ required: true, message: "Producto requerido" }]}
                  >
                    <Select
                      ref={selectProducto}
                      showSearch
                      placeholder="Seleccionar producto"
                      optionFilterProp="children"
                      onChange={onChangeSelect}
                      onFocus={onFocus}
                      onBlur={onBlur}
                      onSearch={onSearch}
                      filterOption={(input, option) =>
                        option.children
                          .toLowerCase()
                          .indexOf(input.toLowerCase()) >= 0
                      }
                    >
                      {productList.map((product) => {
                        const { prod_id, prod_desc } = product;
                        return (
                          <Option
                            key={prod_id}
                            value={prod_id}
                            title={prod_desc}
                          >
                            {prod_desc}
                          </Option>
                        );
                      })}
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={6}>
                  <Form.Item
                    name="cantidad"
                    rules={[{ required: true, message: "Valor requerido" }]}
                  >
                    <InputNumber
                      size="middle"
                      placeholder="Cantidad"
                      type="number"
                      decimalSeparator=","
                      min={0}
                    />
                  </Form.Item>
                </Col>
                <Col xs={5}>
                  <Form.Item
                    name="valor"
                    rules={[{ required: true, message: "Valor requerido" }]}
                  >
                    <InputNumber
                      placeholder="Valor"
                      decimalSeparator=","
                      min={0}
                    />
                  </Form.Item>
                </Col>
                <Col
                  xs={2}
                  style={{ display: "flex", justifyContent: "center" }}
                >
                  <Form.Item>
                    <Button
                      style={{ textAlign: "center" }}
                      htmlType="submit"
                      // onClick={submit}
                      type="dashed"
                      shape="circle"
                    >
                      <PlusOutlined />
                    </Button>

                    {/* <Button type="primary" htmlType="submit" style={{ marginLeft: 5 }}>
                        Calcular total
                    </Button> */}
                  </Form.Item>
                </Col>
              </Row>
            </Form>
            <Row gutter={[8, 8]}>
              <Col xs={24}>
                <Table
                  pagination={false}
                  dataSource={products}
                  columns={columns}
                  responsive
                  // 	style={{ marginBottom: 10 }}
                />
              </Col>
            </Row>
          </div>
          <div className="layout-footer">
            <Fragment>
              <Row gutter={[8, 8]}>
                <Col xs={12}>
                  <Button
                    onClick={() => {
                      // setDealProducts([]);
                      setProducts([]);
                      onClose();
                    }}
                    type="default"
                    block
                  >
                    Cancelar
                  </Button>
                </Col>
                <Col xs={12}>
                  <Form.Item>
                    <Button onClick={saveProducts} type="primary" block>
                      Guardar
                    </Button>
                  </Form.Item>
                </Col>
              </Row>
            </Fragment>
          </div>
        </div>
      </ConfigProvider>
    </Fragment>
  );
};

export default AddProduct;
