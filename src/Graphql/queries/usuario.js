import { gql } from "@apollo/client";

export const GET_GRUPO_POR_USUARIO = gql`
  query getGrupoByUsuario($idUsuario: Int) {
    getGrupoByUsuarioResolver(idUsuario: $idUsuario) {
      gru_id
      gru_nombre
    }
  }
`;
export const GET_USUARIO = gql`
  query getUsuarios($input: String) {
    getUsuariosResolver(input: $input) {
      usu_id
      usu_nombre
    }
  }
`;
export const GET_ALLUSUARIOS = gql`
  query getAllUsuarios {
    getAllUsuariosResolver {
      usu_id
      usu_nombre
    }
  }
`;
export const GET_USUARIO_ASIG = gql`
  query getUsu($idUsuAsig: Int) {
    getUsuAsigResolver(idUsuAsig: $idUsuAsig) {
      usu_nombre
    }
  }
`;
export const GET_USUARIOS_ASIG_NEGOCIOS = gql`
  query getUsuariosAsignadosNegocios {
    getUsuariosAsignadosNegociosResolver {
      usu_id
      usu_nombre
    }
  }
`;

export const GET_GRUPOS_Y_USUARIOS = gql`
  query getSupervisorYUsuariosResolver($idUsuario: Int) {
    getSupervisorYUsuariosResolver(idUsuario: $idUsuario)
  }
`;
