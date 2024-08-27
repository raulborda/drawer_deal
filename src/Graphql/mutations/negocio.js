import { gql } from "@apollo/client";

export const NEW_NEGOCIO = gql`
  mutation newNegocio($input: negocioInput) {
    newNegocioResolver(input: $input) {
      neg_id
    }
  }
`;

export const UPDATE_ESTADO_NEGOCIO = gql`
  mutation updateEstadoNegocio($input: cierresPerdidosXNegocioInput) {
    updateEstadoNegocioResolver(input: $input)
  }
`;

export const UPDATE_VALOR_NEGOCIO = gql`
  mutation updateValorNegocio( 
      $idNegocio: Int
      $valor: Float
    ) {
    updateValorNegocioResolver(
      idNegocio: $idNegocio
      valor: $valor
    )
  }
`;

export const UPDATE_NEGOCIO = gql`
  mutation updateNegocio(
    $usuId: Int
    $etaId: Int
    $idNegocio: Int
    $input: negocioInput
  ) {
    updateNegocioResolver(
      usuId: $usuId
      etaId: $etaId
      idNegocio: $idNegocio
      input: $input
    )
  }
`;

export const NEW_NEGOCIO_MASIVO = gql`
  mutation newNegocioMasivo(
    $etaId: Int
    $input: negocioInput
    $listadoClientes: String
    $inputTarea: tareaInput
  ) {
    newNegocioMasivoResolver(
      etaId: $etaId
      input: $input
      listadoClientes: $listadoClientes
      inputTarea: $inputTarea
    )
  }
`;

export const REASIGN_NEGOCIO = gql`
  mutation reasignNegocioResolver($idNegocio: Int, $idUsuario: Int) {
    reasignNegocioResolver(idNegocio: $idNegocio, idUsuario: $idUsuario)
  }
`;
